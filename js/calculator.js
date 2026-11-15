(function (FreshFold) {
  "use strict";

  var form = document.getElementById("calc-form");
  if (!form) {
    return;
  }

  var serviceSelect = document.getElementById("calc-service");
  var variantField = document.getElementById("calc-variant-field");
  var variantSelect = document.getElementById("calc-variant");
  var quantityInput = document.getElementById("calc-quantity");
  var quantityLabel = document.getElementById("calc-qty-label");
  var quantityHint = document.getElementById("calc-qty-hint");
  var quantityError = document.getElementById("calc-qty-error");
  var unitLabel = document.getElementById("calc-unit");
  var serviceHint = document.getElementById("calc-service-hint");
  var turnaroundHint = document.getElementById("calc-turnaround-hint");
  var addonContainer = document.getElementById("calc-addons");
  var expressInput = form.querySelector('input[name="turnaround"][value="express"]');
  var regularInput = form.querySelector('input[name="turnaround"][value="regular"]');
  var receiptRef = document.getElementById("receipt-ref");
  var receiptService = document.getElementById("receipt-service");
  var receiptMeta = document.getElementById("receipt-service-meta");
  var receiptLines = document.getElementById("receipt-lines");
  var receiptTotal = document.getElementById("receipt-total");
  var receiptNote = document.getElementById("receipt-note");
  var liveRegion = document.getElementById("calc-live");
  var continueButton = document.getElementById("calc-continue");
  var resetButton = document.getElementById("calc-reset");
  var reference = FreshFold.createReference("EST");

  function makeOption(value, label) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function populateServices() {
    serviceSelect.textContent = "";
    FreshFold.services.forEach(function (service) {
      var prefix = service.showFrom ? "mulai " : "";
      serviceSelect.appendChild(
        makeOption(
          service.id,
          service.name + " · " + prefix + FreshFold.formatRupiah(service.basePrice) + "/" + service.unit
        )
      );
    });
  }

  function populateAddons() {
    addonContainer.textContent = "";
    FreshFold.addons.forEach(function (addon) {
      var label = document.createElement("label");
      var input = document.createElement("input");
      var box = document.createElement("span");
      var copy = document.createElement("span");
      var name = document.createElement("strong");
      var description = document.createElement("small");
      var price = document.createElement("span");

      label.className = "check-option";
      label.setAttribute("for", "calc-addon-" + addon.id);
      input.type = "checkbox";
      input.id = "calc-addon-" + addon.id;
      input.name = "addons";
      input.value = addon.id;
      box.className = "check-option__box";
      box.setAttribute("aria-hidden", "true");
      copy.className = "check-option__copy";
      name.textContent = addon.name;
      description.textContent = addon.description;
      price.className = "check-option__price";
      price.textContent = "+" + FreshFold.formatRupiah(addon.price);

      copy.appendChild(name);
      copy.appendChild(description);
      label.appendChild(input);
      label.appendChild(box);
      label.appendChild(copy);
      label.appendChild(price);
      addonContainer.appendChild(label);
    });
  }

  function populateVariants(service, selectedId) {
    variantSelect.textContent = "";
    if (!service.variants.length) {
      variantField.hidden = true;
      variantSelect.value = "";
      return;
    }

    service.variants.forEach(function (variant) {
      variantSelect.appendChild(makeOption(variant.id, variant.name + " · " + FreshFold.formatRupiah(variant.price)));
    });

    variantField.hidden = false;
    var exists = service.variants.some(function (variant) {
      return variant.id === selectedId;
    });
    variantSelect.value = exists ? selectedId : service.variants[0].id;
  }

  function selectedAddonIds() {
    return Array.prototype.slice
      .call(addonContainer.querySelectorAll('input[name="addons"]:checked'))
      .map(function (input) {
        return input.value;
      });
  }

  function setQuantityError(message) {
    if (!message) {
      quantityError.hidden = true;
      quantityError.textContent = "";
      quantityInput.classList.remove("has-error");
      quantityInput.removeAttribute("aria-invalid");
      return;
    }
    quantityError.hidden = false;
    quantityError.textContent = message;
    quantityInput.classList.add("has-error");
    quantityInput.setAttribute("aria-invalid", "true");
  }

  function applyService(serviceId, options) {
    var settings = options || {};
    var service = FreshFold.getService(serviceId) || FreshFold.services[0];
    serviceSelect.value = service.id;

    populateVariants(service, settings.variantId || variantSelect.value);

    quantityLabel.textContent = service.pricingType === "weight" ? "Berat Pakaian" : "Jumlah Item";
    unitLabel.textContent = service.unit;
    quantityInput.step = service.pricingType === "weight" ? "0.5" : "1";
    quantityInput.min = "0";
    serviceHint.textContent =
      service.pricingType === "weight"
        ? "Layanan per kg · minimum " + service.minLabel + "."
        : "Dikenai tarif per item · pilih jenis item.";

    if (!settings.preserveQuantity) {
      quantityInput.value = service.pricingType === "weight" ? String(Math.max(3, service.minQty)) : "1";
    } else {
      var quantity = Number(quantityInput.value);
      if (!Number.isFinite(quantity) || quantity < service.minQty) {
        quantityInput.value = String(service.minQty);
      }
    }

    if (expressInput) {
      expressInput.disabled = !service.expressEligible;
      if (!service.expressEligible) {
        expressInput.checked = false;
        if (regularInput) {
          regularInput.checked = true;
        }
      }
    }

    if (turnaroundHint) {
      turnaroundHint.textContent = service.expressEligible
        ? "Express menambah 50% dan menargetkan 24 jam, tergantung kapasitas."
        : "Express tidak tersedia untuk bedding dan item berat.";
    }

    setQuantityError("");
  }

  function readState() {
    return {
      serviceId: serviceSelect.value,
      variantId: variantSelect.value,
      quantity: quantityInput.value,
      express: Boolean(expressInput && expressInput.checked && !expressInput.disabled),
      addonIds: selectedAddonIds()
    };
  }

  function renderReceipt() {
    var quote = FreshFold.calculateQuote(readState());
    if (!quote) {
      return;
    }

    receiptRef.textContent = reference;
    receiptService.textContent = quote.serviceName;
    receiptLines.textContent = "";

    var metaParts = [];
    if (quote.variantName) {
      metaParts.push(quote.variantName);
    }
    metaParts.push(quote.validQuantity ? quote.quantityLabel : "Jumlah belum diisi");
    metaParts.push(quote.expressApplied ? "express" : "reguler");
    receiptMeta.textContent = metaParts.join(" · ");

    if (quote.validQuantity) {
      var serviceLine = document.createElement("li");
      var serviceLabel = document.createElement("span");
      var serviceAmount = document.createElement("span");
      serviceLabel.textContent =
        quote.serviceName +
        (quote.variantName ? " — " + quote.variantName : "") +
        " (" +
        quote.quantityLabel +
        ")";
      serviceAmount.textContent = FreshFold.formatRupiah(quote.serviceSubtotal);
      serviceLine.appendChild(serviceLabel);
      serviceLine.appendChild(serviceAmount);
      receiptLines.appendChild(serviceLine);

      if (quote.expressApplied) {
        var expressLine = document.createElement("li");
        var expressLabel = document.createElement("span");
        var expressAmount = document.createElement("span");
        expressLabel.textContent = "Layanan Express (+50%)";
        expressAmount.textContent = FreshFold.formatRupiah(quote.expressFee);
        expressLine.appendChild(expressLabel);
        expressLine.appendChild(expressAmount);
        receiptLines.appendChild(expressLine);
      }

      quote.addonItems.forEach(function (addon) {
        var addonLine = document.createElement("li");
        var addonLabel = document.createElement("span");
        var addonAmount = document.createElement("span");
        addonLabel.textContent = addon.name;
        addonAmount.textContent = FreshFold.formatRupiah(addon.price);
        addonLine.appendChild(addonLabel);
        addonLine.appendChild(addonAmount);
        receiptLines.appendChild(addonLine);
      });

      var deliveryLine = document.createElement("li");
      var deliveryLabel = document.createElement("span");
      var deliveryAmount = document.createElement("span");
      deliveryLabel.textContent = "Antar jemput";
      deliveryAmount.textContent = quote.freeDelivery ? "Gratis" : FreshFold.formatRupiah(quote.deliveryFee);
      if (quote.freeDelivery) {
        deliveryLine.className = "is-free";
      }
      deliveryLine.appendChild(deliveryLabel);
      deliveryLine.appendChild(deliveryAmount);
      receiptLines.appendChild(deliveryLine);

      receiptTotal.textContent = FreshFold.formatRupiah(quote.total);

      var noteParts = [];
      if (quote.minimumApplied) {
        noteParts.push("Minimum " + quote.service.minLabel + " diberlakukan.");
      }
      noteParts.push(
        quote.freeDelivery
          ? "Antar jemput gratis diberlakukan."
          : "Termasuk antar jemput."
      );
      receiptNote.textContent = noteParts.join(" ");
      if (liveRegion) {
        liveRegion.textContent =
          "Estimasi total " +
          FreshFold.formatRupiah(quote.total) +
          ", termasuk antar jemput.";
      }
      quantityHint.textContent = quote.minimumApplied
        ? "Minimum " + quote.service.minLabel + " berlaku; estimasi menggunakan jumlah minimum."
        : quote.service.pricingType === "weight"
          ? "Berat akhir kami konfirmasi saat penjemputan."
          : "Jumlah item kami konfirmasi saat penjemputan.";
    } else {
      receiptTotal.textContent = FreshFold.formatRupiah(0);
      receiptNote.textContent = "Masukkan jumlah untuk melihat estimasi.";
      quantityHint.textContent =
        quote.service.pricingType === "weight"
          ? "Minimum " + quote.service.minLabel + " untuk layanan ini. Kami akan menimbang saat penjemputan."
          : "Pilih jenis item dan jumlah. Kami konfirmasi saat penjemputan.";
      if (liveRegion) {
        liveRegion.textContent = "Masukkan jumlah untuk melihat estimasi.";
      }
    }
  }

  function continueToBooking() {
    var quote = FreshFold.calculateQuote(readState());
    var quantity = Number(quantityInput.value);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setQuantityError("Masukkan jumlah lebih dari nol.");
      quantityInput.focus();
      return;
    }

    if (!quote || !quote.validQuantity) {
      setQuantityError("Periksa layanan dan jumlah.");
      return;
    }

    if (quote.service.variants.length && !quote.variant) {
      setQuantityError("Pilih jenis item.");
      variantSelect.focus();
      return;
    }

    setQuantityError("");
    document.dispatchEvent(
      new CustomEvent("freshfold:prefill-booking", {
        detail: {
          serviceId: quote.serviceId,
          variantId: quote.variantId,
          quantity: quote.billableQty,
          express: quote.expressApplied,
          addonIds: quote.addonItems.map(function (addon) {
            return addon.id;
          })
        }
      })
    );

    var booking = document.getElementById("booking");
    if (booking) {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      booking.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }

    FreshFold.ui.showToast("Estimasi Anda telah ditambahkan ke formulir pemesanan.");
  }

  serviceSelect.addEventListener("change", function () {
    applyService(serviceSelect.value, { preserveQuantity: true });
    renderReceipt();
  });

  variantSelect.addEventListener("change", renderReceipt);

  quantityInput.addEventListener("input", function () {
    var quantity = Number(quantityInput.value);
    if (quantityInput.value === "" || !Number.isFinite(quantity) || quantity <= 0) {
      setQuantityError("Masukkan jumlah lebih dari nol.");
    } else {
      setQuantityError("");
    }
    renderReceipt();
  });

  form.querySelectorAll('input[name="turnaround"]').forEach(function (input) {
    input.addEventListener("change", renderReceipt);
  });

  addonContainer.addEventListener("change", renderReceipt);

  continueButton.addEventListener("click", continueToBooking);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    continueToBooking();
  });

  resetButton.addEventListener("click", function () {
    form.reset();
    reference = FreshFold.createReference("EST");
    applyService(FreshFold.services[0].id, { preserveQuantity: false });
    setQuantityError("");
    renderReceipt();
    serviceSelect.focus();
  });

  document.querySelectorAll("[data-select-service]").forEach(function (button) {
    button.addEventListener("click", function () {
      var requested = button.getAttribute("data-select-service");
      var isExpress = requested === "express";
      var serviceId = isExpress ? "wash-fold" : requested;

      applyService(serviceId, { preserveQuantity: false });
      if (isExpress && expressInput && !expressInput.disabled) {
        expressInput.checked = true;
      }
      renderReceipt();

      var calculator = document.getElementById("calculator");
      if (calculator) {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        calculator.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
    });
  });

  populateServices();
  populateAddons();
  applyService(FreshFold.services[0].id, { preserveQuantity: false });
  quantityInput.value = "3";
  renderReceipt();
})(window.FreshFold = window.FreshFold || {});
