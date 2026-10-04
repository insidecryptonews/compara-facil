(() => {
  const config = window.COMPARAFACIL || {};
  const tag = String(config.amazonTag || "").trim();
  const hasTag = /^[a-zA-Z0-9_-]+-21$/.test(tag);
  const maxProducts = 4;
  const products = [];
  let editingId = null;

  const $ = (selector, root = document) => root.querySelector(selector);
  const searchForm = $("#search-form");
  const searchInput = $("#product-search");
  const dialog = $("#product-dialog");
  const productForm = $("#product-form");
  const productList = $("#product-list");
  const template = $("#product-template");
  const message = $("#workspace-message");
  const detailsInput = $("#product-details");

  if (!searchForm) {
    const disclosure = $("#affiliate-disclosure");
    if (disclosure && hasTag) disclosure.textContent = "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.";
    document.querySelectorAll('link[rel="canonical"]').forEach((link) => {
      link.href = `${window.location.origin}${window.location.pathname}`;
    });
    return;
  }

  function amazonSearchUrl(query) {
    const url = new URL("https://www.amazon.es/s");
    url.searchParams.set("k", query);
    if (hasTag) url.searchParams.set("tag", tag);
    return url.toString();
  }

  function safeAmazonUrl(raw, fallbackQuery) {
    if (raw) {
      try {
        const url = new URL(raw);
        const host = url.hostname.toLowerCase();
        if (url.protocol === "https:" && (host === "amazon.es" || host.endsWith(".amazon.es"))) {
          if (hasTag) url.searchParams.set("tag", tag);
          return url.toString();
        }
        if (url.protocol === "https:" && host === "amzn.to") return url.toString();
      } catch {
        return "";
      }
      return "";
    }
    return fallbackQuery ? amazonSearchUrl(fallbackQuery) : "";
  }

  function setMessage(text, state = "") {
    message.textContent = text;
    message.dataset.state = state;
  }

  function parseDetails(raw) {
    return raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const splitAt = line.indexOf(":");
      return splitAt > 0
        ? { name: line.slice(0, splitAt).trim(), value: line.slice(splitAt + 1).trim() }
        : { name: "Detalle", value: line };
    }).filter((item) => item.name && item.value).slice(0, 12);
  }

  function openDialog(product = null, query = "") {
    if (!product && products.length >= maxProducts) {
      setMessage(`Puedes comparar hasta ${maxProducts} productos a la vez.`, "error");
      return;
    }
    editingId = product?.id || null;
    productForm.reset();
    $("#form-error").textContent = "";
    $("#dialog-title").textContent = product ? "Edita el producto" : "Añade un producto";
    $("#product-name").value = product?.name || query;
    $("#product-price").value = product?.price ?? "";
    $("#product-link").value = product?.sourceUrl || "";
    detailsInput.value = product?.details.map((item) => `${item.name}: ${item.value}`).join("\n") || "";
    dialog.showModal();
    $("#product-name").focus();
  }

  function closeDialog() {
    dialog.close();
    editingId = null;
  }

  function renderTable() {
    const section = $("#comparison-section");
    const tableHost = $("#comparison-table");
    if (products.length < 2) {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    const attributes = new Map();
    products.forEach((product) => product.details.forEach((detail) => {
      const key = detail.name.toLocaleLowerCase("es");
      if (!attributes.has(key)) attributes.set(key, detail.name);
    }));
    const table = document.createElement("table");
    table.className = "compare-table";
    const head = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const criteriaHeader = document.createElement("th");
    criteriaHeader.scope = "col";
    criteriaHeader.textContent = "QUÉ COMPARAS";
    headerRow.append(criteriaHeader);
    products.forEach((product, index) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      const label = document.createElement("span");
      label.className = "table-index";
      label.textContent = `0${index + 1}`;
      const name = document.createElement("span");
      name.className = "table-product-name";
      name.textContent = product.name;
      cell.append(label, name);
      headerRow.append(cell);
    });
    head.append(headerRow);
    table.append(head);

    const body = document.createElement("tbody");
    const priceRow = document.createElement("tr");
    const priceLabel = document.createElement("th");
    priceLabel.scope = "row";
    priceLabel.textContent = "Precio indicado";
    priceRow.append(priceLabel);
    products.forEach((product) => {
      const cell = document.createElement("td");
      cell.textContent = product.price === "" ? "Sin indicar" : `${Number(product.price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
      priceRow.append(cell);
    });
    body.append(priceRow);

    attributes.forEach((name, key) => {
      const row = document.createElement("tr");
      const label = document.createElement("th");
      label.scope = "row";
      label.textContent = name;
      row.append(label);
      products.forEach((product) => {
        const value = product.details.find((detail) => detail.name.toLocaleLowerCase("es") === key)?.value || "—";
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      body.append(row);
    });
    table.append(body);
    tableHost.replaceChildren(table);
  }

  function render() {
    productList.replaceChildren();
    products.forEach((product, index) => {
      const fragment = template.content.cloneNode(true);
      const card = $(".workspace-card", fragment);
      card.dataset.productId = product.id;
      $(".card-index", card).textContent = `PRODUCTO 0${index + 1}`;
      $(".workspace-product-icon", card).textContent = String.fromCharCode(65 + index);
      $(".workspace-product-title h3", card).textContent = product.name;
      $(".product-price", card).textContent = product.price === "" ? "Precio sin indicar" : `${Number(product.price).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
      const details = $(".workspace-details", card);
      if (product.details.length) {
        product.details.slice(0, 3).forEach((item) => {
          const line = document.createElement("div");
          line.className = "detail-pill";
          const label = document.createElement("span");
          label.textContent = item.name;
          const value = document.createElement("b");
          value.textContent = item.value;
          line.append(label, value);
          details.append(line);
        });
        if (product.details.length > 3) {
          const more = document.createElement("span");
          more.className = "more-details";
          more.textContent = `+ ${product.details.length - 3} detalles en la comparativa`;
          details.append(more);
        }
      } else {
        const empty = document.createElement("p");
        empty.className = "no-details";
        empty.textContent = "Añade características para verlas en la tabla.";
        details.append(empty);
      }
      const open = $(".open-product", card);
      const href = safeAmazonUrl(product.sourceUrl, product.name);
      if (href) {
        open.href = href;
        open.hidden = false;
      }
      $(".remove-product", card).addEventListener("click", () => {
        products.splice(products.findIndex((item) => item.id === product.id), 1);
        setMessage(`${product.name} se quitó de la comparativa.`);
        render();
      });
      $(".edit-product", card).addEventListener("click", () => openDialog(product));
      productList.append(fragment);
    });

    const count = products.length;
    $("#nav-count").textContent = String(count);
    $("#workspace-count").textContent = `(${count})`;
    $("#add-product-button").disabled = count >= maxProducts;
    $("#add-product-button").innerHTML = count >= maxProducts ? "Máximo alcanzado" : "<span>＋</span> Añadir producto";
    $("#empty-state").hidden = count > 0;
    productList.hidden = count === 0;
    renderTable();
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (!query) {
      searchInput.focus();
      setMessage("Escribe qué producto quieres buscar.", "error");
      return;
    }
    const opened = window.open(amazonSearchUrl(query), "_blank");
    if (!opened) setMessage("El navegador bloqueó la nueva pestaña. Permite abrir Amazon para continuar.", "error");
    else {
      opened.opener = null;
      setMessage(`Resultados abiertos en Amazon para «${query}». Cuando elijas uno, copia su ficha y añádelo aquí.`, "success");
      openDialog(null, query);
    }
  });

  document.querySelectorAll("[data-query]").forEach((button) => button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    searchForm.requestSubmit();
  }));
  document.querySelectorAll("[data-open-product]").forEach((button) => button.addEventListener("click", () => openDialog()));
  $("#add-product-button").addEventListener("click", () => openDialog());
  document.querySelectorAll("[data-close-dialog]").forEach((button) => button.addEventListener("click", closeDialog));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = $("#product-name").value.trim();
    const rawUrl = $("#product-link").value.trim();
    const priceValue = $("#product-price").value.trim().replace(",", ".");
    const sourceUrl = safeAmazonUrl(rawUrl, name);
    if (rawUrl && !sourceUrl) {
      $("#form-error").textContent = "Pega un enlace seguro de Amazon.es (https://www.amazon.es/…).";
      $("#product-link").focus();
      return;
    }
    const product = {
      id: editingId || (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      name,
      price: priceValue,
      sourceUrl: rawUrl ? sourceUrl : "",
      details: parseDetails(detailsInput.value)
    };
    if (editingId) {
      const index = products.findIndex((item) => item.id === editingId);
      if (index >= 0) products[index] = product;
      setMessage(`${name} se actualizó.`);
    } else {
      products.push(product);
      setMessage(`${name} se añadió a la comparativa.`, "success");
    }
    closeDialog();
    render();
  });

  $("#clear-products").addEventListener("click", () => {
    products.splice(0, products.length);
    setMessage("La comparativa está vacía. Añade otros productos cuando quieras.");
    render();
  });

  const disclosure = $("#affiliate-disclosure");
  if (disclosure && hasTag) disclosure.textContent = "En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.";
  document.querySelectorAll('link[rel="canonical"]').forEach((link) => {
    link.href = `${window.location.origin}${window.location.pathname}`;
  });
  render();
})();
