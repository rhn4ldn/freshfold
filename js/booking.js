(function (FreshFold) {
  "use strict";

  var config = FreshFold.config;
  var form = document.getElementById("booking-form");
  if (!form) {
    return;
  }

  var formStatus = document.getElementById("form-status");
  var fullName = document.getElementById("full-name");
  var whatsapp = document.getElementById("whatsapp");
  var email = document.getElementById("email");
  var serviceSelect = document.getElementById("booking-service");
  var serviceHint = document.getElementById("booking-service-hint");
  var variantField = document.getElementById("booking-variant-field");
  var variantSelect = document.getElementById("booking-variant");
  var quantityInput = document.getElementById("booking-quantity");
  var quantityLabel = document.getElementById("booking-qty-label");
  var quantityHint = document.getElementById("booking-qty-hint");
  var unitLabel = document.getElementById("booking-unit");
  var expressInput = document.getElementById("booking-express");
  var expressHint = document.getElementById("booking-express-hint");
  var addonContainer = document.getElementById("booking-addons");
  var instructions = document.getElementById("instructions");
  var instructionsCount = document.getElementById("instructions-count");
  var pickupAddress = document.getElementById("pickup-address");
  var district = document.getElementById("district");
  var pickupDate = document.getElementById("pickup-date");
  var pickupSlot = document.getElementById("pickup-slot");
  var sameAddress = document.getElementById("same-address");
  var deliveryAddress = document.getElementById("delivery-address");
  var deliveryPreference = document.getElementById("delivery-preference");
  var acknowledge = document.getElementById("acknowledge");
  var summaryService = document.getElementById("summary-service");
  var summaryQuantity = document.getElementById("summary-quantity");
  var summaryAddons = document.getElementById("summary-addons");
  var summaryTurnaround = document.getElementById("summary-turnaround");
  var summaryDelivery = document.getElementById("summary-delivery");
  var summaryTotal = document.getElementById("booking-total");
  var summaryNote = document.getElementById("booking-summary-note");
  var draftStatus = document.getElementById("draft-status");
  var clearDraftButton = document.getElementById("clear-draft");
  var dialog = document.getElementById("summary-dialog");
  var summaryContent = document.getElementById("summary-content");
  var summaryRef = document.getElementById("summary-ref");
  var summaryClose = document.getElementById("summary-close");
  var summaryEdit = document.getElementById("summary-edit");
  var confirmWhatsApp = document.getElementById("confirm-whatsapp");
  var draftTimer = null;
  var currentBooking = null;

  function byId(id) {
    return document.getElementById(id);
  }

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
      label.setAttribute("for", "booking-addon-" + addon.id);
      input.type = "checkbox";
      input.id = "booking-addon-" + addon.id;
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
      variantSelect.appendChild(
        makeOption(variant.id, variant.name + " · " + FreshFold.formatRupiah(variant.price))
      );
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

  function syncService(options) {
    var settings = options || {};
    var service = FreshFold.getService(serviceSelect.value) || FreshFold.services[0];
    serviceSelect.value = service.id;
    populateVariants(service, settings.variantId || variantSelect.value);

    if (serviceHint) {
      serviceHint.textContent =
        service.pricingType === "weight"
          ? "Layanan per kg · minimum " + service.minLabel + "."
          : "Dikenai tarif per item · pilih jenis item.";
    }

    quantityLabel.textContent = service.pricingType === "weight" ? "Berat Pakaian" : "Jumlah Item";
    unitLabel.textContent = service.unit;
    quantityInput.step = service.pricingType === "weight" ? "0.5" : "1";
    quantityInput.min = "0";
    quantityHint.textContent =
      service.pricingType === "weight"
        ? "Minimum " + service.minLabel + " untuk layanan ini. Kami akan menimbang saat penjemputan."
        : "Pilih jenis item dan jumlah. Kami konfirmasi saat penjemputan.";

    if (!settings.preserveQuantity) {
      quantityInput.value =
        service.pricingType === "weight" ? String(Math.max(3, service.minQty)) : "1";
    } else {
      var quantity = Number(quantityInput.value);
      if (!Number.isFinite(quantity) || quantity < service.minQty) {
        quantityInput.value = String(service.minQty);
      }
    }

    expressInput.disabled = !service.expressEligible;
    if (!service.expressEligible) {
      expressInput.checked = false;
    }
    expressHint.textContent = service.expressEligible
      ? "Menambah 50% dan menargetkan 24 jam, tergantung kapasitas."
      : "Express tidak tersedia untuk bedding dan item berat.";
  }

  function updateSameAddress() {
    var same = sameAddress.checked;
    deliveryAddress.disabled = same;
    deliveryAddress.required = !same;
    deliveryAddress.setAttribute("aria-required", String(!same));
    if (same) {
      setError("delivery-address", "");
    }
  }

  function updateInstructionsCount() {
    if (instructionsCount) {
      instructionsCount.textContent = String(instructions.value.length);
    }
  }

  function updateSummary() {
    var service = FreshFold.getService(serviceSelect.value) || FreshFold.services[0];
    var quote = FreshFold.calculateQuote({
      serviceId: service.id,
      variantId: variantSelect.value,
      quantity: quantityInput.value,
      express: Boolean(expressInput.checked && !expressInput.disabled),
      addonIds: selectedAddonIds()
    });

    if (!quote) {
      return;
    }

    summaryService.textContent = quote.serviceName + (quote.variantName ? " — " + quote.variantName : "");
    summaryQuantity.textContent = quote.validQuantity ? quote.quantityLabel : "Belum diisi";
    summaryAddons.textContent = quote.addonItems.length
      ? quote.addonItems
          .map(function (addon) {
            return addon.name;
          })
          .join(", ")
      : "Tidak ada";
    summaryTurnaround.textContent = quote.validQuantity ? quote.turnaroundLabel : "—";
    summaryDelivery.textContent = quote.validQuantity
      ? quote.freeDelivery
        ? "Gratis"
        : FreshFold.formatRupiah(quote.deliveryFee)
      : "—";
    summaryTotal.textContent = FreshFold.formatRupiah(quote.total);
    summaryNote.textContent = quote.validQuantity
      ? quote.minimumApplied
        ? "Minimum " + service.minLabel + " diberlakukan. Harga akhir dikonfirmasi setelah penimbangan dan pemeriksaan."
        : "Harga akhir dikonfirmasi setelah penimbangan dan pemeriksaan."
      : "Tambahkan jumlah untuk melihat estimasi langsung.";
  }

  function setError(id, message) {
    var field = byId(id);
    var error = byId(id + "-error");
    if (field) {
      field.classList.toggle("has-error", Boolean(message));
      if (message) {
        field.setAttribute("aria-invalid", "true");
      } else {
        field.removeAttribute("aria-invalid");
      }
    }
    if (error) {
      error.hidden = !message;
      error.textContent = message || "";
    }
  }

  function clearAllErrors() {
    form.querySelectorAll(".has-error").forEach(function (field) {
      field.classList.remove("has-error");
      field.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".field__error").forEach(function (error) {
      error.hidden = true;
      error.textContent = "";
    });
    if (formStatus) {
      formStatus.hidden = true;
      formStatus.textContent = "";
    }
  }

  function createVariantError() {
    if (!variantField || byId("booking-variant-error")) {
      return;
    }
    var error = document.createElement("p");
    error.className = "field__error";
    error.id = "booking-variant-error";
    error.hidden = true;
    variantField.appendChild(error);
    variantSelect.setAttribute("aria-describedby", "booking-variant-error");
  }

  function getPayment() {
    var checked = form.querySelector('input[name="payment"]:checked');
    return checked ? checked.value : "Bayar di rumah";
  }

  function normalizePhone(value) {
    return String(value || "").replace(/[\s().-]/g, "");
  }

  function validateForm() {
    clearAllErrors();
    var errors = [];

    function fail(id, message) {
      setError(id, message);
      errors.push(id);
    }

    var service = FreshFold.getService(serviceSelect.value);
    var name = fullName.value.trim();
    var phone = normalizePhone(whatsapp.value);
    var emailValue = email.value.trim();
    var quantity = Number(quantityInput.value);

    if (name.length < 2) {
      fail("full-name", "Masukkan nama lengkap Anda.");
    }

    if (!/^(\+62|62|0)8[1-9]\d{6,11}$/.test(phone)) {
      fail("whatsapp", "Masukkan nomor WhatsApp Indonesia yang valid.");
    }

    if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
      fail("email", "Masukkan alamat email yang valid, atau kosongkan.");
    }

    if (!service) {
      fail("booking-service", "Pilih layanan.");
    }

    if (service && service.variants.length && !variantSelect.value) {
      fail("booking-variant", "Pilih jenis item.");
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      fail("booking-quantity", "Masukkan jumlah lebih dari nol.");
    } else if (service && quantity < service.minQty) {
      fail("booking-quantity", "Minimum " + service.minLabel + " untuk " + service.name + ".");
    } else if (service && service.pricingType === "item" && !Number.isInteger(quantity)) {
      fail("booking-quantity", "Masukkan jumlah item bilangan bulat.");
    }

    if (pickupAddress.value.trim().length < 10) {
      fail("pickup-address", "Masukkan alamat penjemputan yang lengkap.");
    }

    if (!district.value) {
      fail("district", "Pilih kecamatan Anda.");
    } else if (!FreshFold.isAreaAvailable(district.value)) {
      fail("district", "Penjemputan tidak tersedia di area tersebut.");
    }

    var dateError = FreshFold.validatePickupDate(pickupDate.value);
    if (dateError) {
      fail("pickup-date", dateError);
    }

    if (!pickupSlot.value) {
      fail("pickup-slot", "Pilih jendela waktu penjemputan.");
    }

    if (!sameAddress.checked && deliveryAddress.value.trim().length < 10) {
      fail("delivery-address", "Masukkan alamat pengantaran yang lengkap.");
    }

    if (instructions.value.length > config.maxInstructions) {
      fail("instructions", "Batasi catatan hingga " + config.maxInstructions + " karakter.");
    }

    if (!acknowledge.checked) {
      fail("acknowledge", "Mohon konfirmasi bahwa Anda memahami ini adalah permintaan pemesanan.");
    }

    if (errors.length) {
      if (formStatus) {
        formStatus.hidden = false;
        formStatus.textContent =
          errors.length === 1
            ? "Periksa kolom yang ditandai sebelum melanjutkan."
            : "Periksa " + errors.length + " kolom yang ditandai sebelum melanjutkan.";
      }
      var first = byId(errors[0]);
      if (first) {
        first.focus();
      }
      return null;
    }

    return collectBooking();
  }

  function collectBooking() {
    var service = FreshFold.getService(serviceSelect.value);
    var variant = FreshFold.getVariant(service, variantSelect.value);
    var addonIds = selectedAddonIds();
    var quantity = Number(quantityInput.value);
    var express = Boolean(expressInput.checked && !expressInput.disabled && service.expressEligible);
    var quote = FreshFold.calculateQuote({
      serviceId: service.id,
      variantId: variant ? variant.id : "",
      quantity: quantity,
      express: express,
      addonIds: addonIds
    });
    var same = sameAddress.checked;
    var reference = FreshFold.createReference("BK");
    var booking = {
      reference: reference,
      fullName: fullName.value.trim(),
      whatsapp: whatsapp.value.trim(),
      email: email.value.trim(),
      service: service,
      variant: variant,
      quantity: quantity,
      express: express,
      addonIds: addonIds,
      addonItems: quote.addonItems,
      quote: quote,
      instructions: instructions.value.trim(),
      pickupAddress: pickupAddress.value.trim(),
      district: district.value,
      pickupDate: pickupDate.value,
      pickupSlot: pickupSlot.value,
      sameAddress: same,
      deliveryAddress: same ? pickupAddress.value.trim() : deliveryAddress.value.trim(),
      deliveryPreference: deliveryPreference.value,
      payment: getPayment()
    };

    booking.message = buildMessage(booking);
    return booking;
  }

  function buildMessage(booking) {
    var addonNames = booking.addonItems.length
      ? booking.addonItems
          .map(function (addon) {
            return addon.name;
          })
          .join(", ")
      : "Tidak ada";

    var lines = [
      "Halo FreshFold Laundry, saya ingin melakukan pemesanan.",
      "",
      "Referensi: " + booking.reference,
      "",
      "DETAIL PELANGGAN",
      "Nama: " + booking.fullName,
      "WhatsApp: " + booking.whatsapp
    ];

    if (booking.email) {
      lines.push("Email: " + booking.email);
    }

    lines.push(
      "",
      "DETAIL PESANAN",
      "Layanan: " + booking.service.name + (booking.variant ? " — " + booking.variant.name : ""),
      "Jumlah: " + booking.quote.quantityLabel,
      "Pengerjaan: " + booking.quote.turnaroundLabel,
      "Tambahan: " + addonNames,
      "Estimasi: " +
        FreshFold.formatRupiah(booking.quote.total) +
        " (termasuk antar jemput; final dikonfirmasi setelah penimbangan)",
      "",
      "PENJEMPUTAN",
      "Alamat: " + booking.pickupAddress,
      "Kecamatan: " + booking.district,
      "Tanggal: " + FreshFold.formatDateID(booking.pickupDate),
      "Jadwal: " + booking.pickupSlot,
      "Pengantaran: " +
        (booking.sameAddress ? "Sama dengan alamat penjemputan" : booking.deliveryAddress),
      "Preferensi pengantaran: " + booking.deliveryPreference,
      "",
      "CATATAN",
      booking.instructions || "Tidak ada catatan khusus.",
      "",
      "Pembayaran: " + booking.payment,
      "",
      "Mohon konfirmasi ketersediaan jadwal dan pesanan saya."
    );

    return lines.join("\n");
  }

  function summaryRow(label, value) {
    return "<div><dt>" + label + "</dt><dd>" + value + "</dd></div>";
  }

  function summaryGroup(title, rows) {
    return (
      '<section class="summary-group"><h3>' +
      title +
      "</h3><dl>" +
      rows.join("") +
      "</dl></section>"
    );
  }

  function buildSummaryHTML(booking) {
    var escape = FreshFold.escapeHTML;
    var customerRows = [
      summaryRow("Nama", escape(booking.fullName)),
      summaryRow("WhatsApp", escape(booking.whatsapp))
    ];

    if (booking.email) {
      customerRows.push(summaryRow("Email", escape(booking.email)));
    }

    var orderRows = [
      summaryRow("Layanan", escape(booking.service.name)),
      summaryRow("Jenis item", escape(booking.variant ? booking.variant.name : "Standar")),
      summaryRow("Jumlah", escape(booking.quote.quantityLabel)),
      summaryRow("Estimasi pengerjaan", escape(booking.quote.turnaroundLabel)),
      summaryRow(
        "Tambahan",
        escape(
          booking.addonItems.length
            ? booking.addonItems
                .map(function (addon) {
                  return addon.name;
                })
                .join(", ")
            : "Tidak ada"
        )
      )
    ];

    var pickupRows = [
      summaryRow("Tanggal", escape(FreshFold.formatDateID(booking.pickupDate))),
      summaryRow("Jendela waktu", escape(booking.pickupSlot)),
      summaryRow("Alamat", escape(booking.pickupAddress)),
      summaryRow("Kecamatan", escape(booking.district))
    ];

    var deliveryRows = [
      summaryRow(
        "Address",
        escape(booking.sameAddress ? "Sama dengan alamat penjemputan" : booking.deliveryAddress)
      ),
      summaryRow("Preferensi", escape(booking.deliveryPreference)),
      summaryRow("Pembayaran", escape(booking.payment))
    ];

    var estimateRows = [
      summaryRow(
        escape(
          booking.service.name +
            (booking.variant ? " — " + booking.variant.name : "") +
            " (" +
            booking.quote.quantityLabel +
            ")"
        ),
        escape(FreshFold.formatRupiah(booking.quote.serviceSubtotal))
      )
    ];

    if (booking.quote.expressApplied) {
      estimateRows.push(
        summaryRow("Layanan Express (+50%)", escape(FreshFold.formatRupiah(booking.quote.expressFee)))
      );
    }

    booking.addonItems.forEach(function (addon) {
      estimateRows.push(summaryRow(escape(addon.name), escape(FreshFold.formatRupiah(addon.price))));
    });

    estimateRows.push(
      summaryRow(
        "Antar jemput",
        escape(
          booking.quote.freeDelivery ? "Gratis" : FreshFold.formatRupiah(booking.quote.deliveryFee)
        )
      )
    );

    var estimateTotal =
      '<div class="summary-total"><span>Estimasi total</span><strong>' +
      escape(FreshFold.formatRupiah(booking.quote.total)) +
      "</strong></div>";

    var noteHTML =
      '<section class="summary-group"><h3>Catatan</h3><p>' +
      escape(booking.instructions || "Tidak ada catatan khusus.") +
      "</p></section>";

    return (
      summaryGroup("Pelanggan", customerRows) +
      summaryGroup("Pesanan", orderRows) +
      summaryGroup("Penjemputan", pickupRows) +
      summaryGroup("Pengantaran & pembayaran", deliveryRows) +
      '<section class="summary-group"><h3>Estimasi</h3><dl>' +
      estimateRows.join("") +
      "</dl>" +
      estimateTotal +
      "</section>" +
      noteHTML
    );
  }

  function openReview(booking) {
    currentBooking = booking;
    summaryRef.textContent = booking.reference;
    summaryContent.innerHTML = buildSummaryHTML(booking);
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  function saveDraft() {
    try {
      var draft = {
        savedAt: Date.now(),
        fullName: fullName.value,
        whatsapp: whatsapp.value,
        email: email.value,
        service: serviceSelect.value,
        variant: variantSelect.value,
        quantity: quantityInput.value,
        express: expressInput.checked,
        addons: selectedAddonIds(),
        instructions: instructions.value,
        pickupAddress: pickupAddress.value,
        district: district.value,
        pickupDate: pickupDate.value,
        pickupSlot: pickupSlot.value,
        sameAddress: sameAddress.checked,
        deliveryAddress: deliveryAddress.value,
        deliveryPreference: deliveryPreference.value,
        payment: getPayment()
      };
      window.localStorage.setItem(config.draftKey, JSON.stringify(draft));
    } catch (error) {
      return;
    }
  }

  function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraft, 450);
  }

  function clearDraft(showMessage) {
    window.clearTimeout(draftTimer);
    draftTimer = null;
    try {
      window.localStorage.removeItem(config.draftKey);
    } catch (error) {
      return;
    }
    if (draftStatus) {
      draftStatus.hidden = true;
      draftStatus.textContent = "";
    }
    if (showMessage) {
      FreshFold.ui.showToast("Draft pemesanan tersimpan dihapus.");
    }
  }

  function readDraft() {
    try {
      var raw = window.localStorage.getItem(config.draftKey);
      if (!raw) {
        return null;
      }
      var draft = JSON.parse(raw);
      var age = Date.now() - Number(draft.savedAt);
      if (!draft.savedAt || age > config.draftTtlDays * 24 * 60 * 60 * 1000) {
        window.localStorage.removeItem(config.draftKey);
        return null;
      }
      return draft;
    } catch (error) {
      return null;
    }
  }

  function restoreDraft() {
    var draft = readDraft();
    if (!draft) {
      return;
    }

    var service = FreshFold.getService(draft.service);
    if (service) {
      serviceSelect.value = service.id;
      syncService({ preserveQuantity: true, variantId: draft.variant });
    }

    if (draft.variant && variantSelect.querySelector('option[value="' + draft.variant + '"]')) {
      variantSelect.value = draft.variant;
    }

    fullName.value = draft.fullName || "";
    whatsapp.value = draft.whatsapp || "";
    email.value = draft.email || "";
    quantityInput.value = draft.quantity || quantityInput.value;
    expressInput.checked = Boolean(draft.express) && !expressInput.disabled;
    instructions.value = draft.instructions || "";
    pickupAddress.value = draft.pickupAddress || "";
    district.value = draft.district || "";
    pickupDate.value = draft.pickupDate || "";
    pickupSlot.value = draft.pickupSlot || "";
    sameAddress.checked = Boolean(draft.sameAddress);
    deliveryAddress.value = draft.deliveryAddress || "";
    deliveryPreference.value = draft.deliveryPreference || config.deliveryPreferences[0];

    var payment = form.querySelector('input[name="payment"][value="' + (draft.payment || "") + '"]');
    if (payment) {
      payment.checked = true;
    }

    if (Array.isArray(draft.addons)) {
      addonContainer.querySelectorAll('input[name="addons"]').forEach(function (input) {
        input.checked = draft.addons.indexOf(input.value) !== -1;
      });
    }

    if (FreshFold.validatePickupDate(pickupDate.value)) {
      pickupDate.value = FreshFold.getSuggestedPickupDate();
    }

    updateSameAddress();
    updateInstructionsCount();

    if (draftStatus) {
      var formatter = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
      draftStatus.hidden = false;
      draftStatus.textContent = "Draft dipulihkan dari " + formatter.format(new Date(draft.savedAt)) + ".";
    }
  }

  function handleFormChange(event) {
    var target = event.target;

    if (target && target.id) {
      setError(target.id, "");
    }

    if (target === serviceSelect) {
      syncService({ preserveQuantity: true });
      setError("booking-quantity", "");
      setError("booking-variant", "");
    }

    if (target === sameAddress) {
      updateSameAddress();
    }

    if (target === instructions) {
      updateInstructionsCount();
    }

    updateSummary();
    scheduleDraftSave();
  }

  function handleSubmit(event) {
    event.preventDefault();
    var booking = validateForm();
    if (booking) {
      openReview(booking);
    }
  }

  function handleConfirm() {
    if (!currentBooking) {
      return;
    }

    var url = FreshFold.getWhatsAppUrl(currentBooking.message);
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();

    clearDraft(false);
    currentBooking = null;
    closeDialog();
    FreshFold.ui.showToast("WhatsApp telah dibuka dengan permintaan pemesanan Anda. Kami konfirmasi di sana.");
  }

  populateServices();
  populateAddons();
  createVariantError();

  if (pickupDate) {
    pickupDate.min = FreshFold.getMinPickupDate();
    pickupDate.max = FreshFold.getMaxPickupDate();
    if (!pickupDate.value) {
      pickupDate.value = FreshFold.getSuggestedPickupDate();
    }
  }

  syncService({ preserveQuantity: false });
  updateSameAddress();
  updateInstructionsCount();
  restoreDraft();
  updateSummary();

  form.addEventListener("input", handleFormChange);
  form.addEventListener("change", handleFormChange);
  form.addEventListener("submit", handleSubmit);

  form.addEventListener("reset", function () {
    window.setTimeout(function () {
      clearAllErrors();
      syncService({ preserveQuantity: false });
      pickupDate.value = FreshFold.getSuggestedPickupDate();
      updateSameAddress();
      updateInstructionsCount();
      updateSummary();
      clearDraft(false);
      if (formStatus) {
        formStatus.hidden = true;
      }
      FreshFold.ui.showToast("Formulir pemesanan diatur ulang.");
    }, 0);
  });

  document.addEventListener("freshfold:prefill-booking", function (event) {
    var detail = event.detail || {};
    var service = FreshFold.getService(detail.serviceId);
    if (!service) {
      return;
    }

    serviceSelect.value = service.id;
    syncService({ preserveQuantity: true, variantId: detail.variantId });

    if (detail.variantId && variantSelect.querySelector('option[value="' + detail.variantId + '"]')) {
      variantSelect.value = detail.variantId;
    }

    quantityInput.value = String(Math.max(Number(detail.quantity) || service.minQty, service.minQty));
    expressInput.checked = Boolean(detail.express) && service.expressEligible;
    addonContainer.querySelectorAll('input[name="addons"]').forEach(function (input) {
      input.checked = Array.isArray(detail.addonIds) && detail.addonIds.indexOf(input.value) !== -1;
    });

    setError("booking-quantity", "");
    setError("booking-variant", "");
    updateSummary();
    scheduleDraftSave();
  });

  document.addEventListener("freshfold:clear-draft", function () {
    clearDraft(true);
  });

  if (clearDraftButton) {
    clearDraftButton.addEventListener("click", function () {
      clearDraft(true);
    });
  }

  if (summaryClose) {
    summaryClose.addEventListener("click", closeDialog);
  }

  if (summaryEdit) {
    summaryEdit.addEventListener("click", function () {
      closeDialog();
      window.setTimeout(function () {
        fullName.focus();
      }, 0);
    });
  }

  if (confirmWhatsApp) {
    confirmWhatsApp.addEventListener("click", handleConfirm);
  }

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeDialog();
      }
    });
    dialog.addEventListener("close", function () {
      currentBooking = null;
    });
  }
})(window.FreshFold = window.FreshFold || {});
