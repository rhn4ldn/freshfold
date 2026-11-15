(function (StarClean) {
  "use strict";

  var config = StarClean.config;

  var SERVICES = [
    {
      id: "wash-fold",
      name: "Cuci & Lipat",
      pricingType: "weight",
      unit: "kg",
      unitPlural: "kg",
      minQty: 2,
      minLabel: "2 kg",
      basePrice: 5000,
      showFrom: false,
      turnaround: "2–3 hari",
      expressEligible: true,
      expressTurnaround: "24 jam",
      description: "Pakaian sehari-hari dicuci, dikeringkan, dan dilipat rapi.",
      variants: []
    },
    {
      id: "wash-iron",
      name: "Cuci & Setrika",
      pricingType: "weight",
      unit: "kg",
      unitPlural: "kg",
      minQty: 2,
      minLabel: "2 kg",
      basePrice: 6000,
      showFrom: false,
      turnaround: "2–3 hari",
      expressEligible: true,
      expressTurnaround: "24 jam",
      description: "Dicuci, disetrika, dan dikembalikan dalam keadaan digantung.",
      variants: []
    },
    {
      id: "dry-cleaning",
      name: "Dry Cleaning",
      pricingType: "item",
      unit: "item",
      unitPlural: "item",
      minQty: 1,
      minLabel: "1 item",
      basePrice: 25000,
      showFrom: true,
      turnaround: "3–5 hari",
      expressEligible: true,
      expressTurnaround: "24 jam",
      description: "Perawatan pelarut lembut untuk pakaian berstruktur dan khusus dry clean.",
      variants: [
        { id: "shirt-blouse", name: "Kemeja / Blus", price: 25000 },
        { id: "trousers-skirt", name: "Celana / Rok", price: 30000 },
        { id: "dress", name: "Gaun", price: 40000 },
        { id: "suit-jacket", name: "Jas", price: 55000 },
        { id: "coat", name: "Mantel", price: 65000 }
      ]
    },
    {
      id: "ironing-only",
      name: "Setrika Saja",
      pricingType: "weight",
      unit: "kg",
      unitPlural: "kg",
      minQty: 2,
      minLabel: "2 kg",
      basePrice: 3000,
      showFrom: false,
      turnaround: "1–2 hari",
      expressEligible: true,
      expressTurnaround: "24 jam",
      description: "Pakaian yang sudah bersih disetrika dan dikembalikan rapi.",
      variants: []
    },
    {
      id: "bedding",
      name: "Bed Cover & Selimut",
      pricingType: "item",
      unit: "item",
      unitPlural: "item",
      minQty: 1,
      minLabel: "1 item",
      basePrice: 5000,
      showFrom: true,
      turnaround: "3–4 hari",
      expressEligible: false,
      expressTurnaround: "",
      description: "Bed cover, selimut, dan set seprai dicuci dengan ruang yang cukup.",
      variants: [
        { id: "bed-cover-biasa", name: "Bed Cover Biasa", price: 20000 },
        { id: "bed-cover-besar", name: "Bed Cover Besar", price: 25000 },
        { id: "selimut-tipis", name: "Selimut Tipis", price: 5000 },
        { id: "selimut-tebal", name: "Selimut Tebal", price: 20000 }
      ]
    },
    {
      id: "laundry-boneka",
      name: "Laundry Boneka",
      pricingType: "item",
      unit: "item",
      unitPlural: "item",
      minQty: 1,
      minLabel: "1 item",
      basePrice: 3000,
      showFrom: true,
      turnaround: "Menyesuaikan",
      expressEligible: false,
      expressTurnaround: "",
      description: "Boneka dicuci bersih dan dikeringkan hingga benar-benar kering.",
      variants: [
        { id: "boneka-kecil", name: "Boneka Kecil", price: 3000 },
        { id: "boneka-sedang", name: "Boneka Sedang", price: 5000 },
        { id: "boneka-besar", name: "Boneka Besar", price: 15000, priceMax: 20000, note: "Harga akhir boneka besar menyesuaikan ukuran dan akan dikonfirmasi oleh admin." }
      ]
    }
  ];

  var ADDONS = [
    {
      id: "premium-fragrance",
      name: "Pewangi Premium",
      price: 3000,
      description: "Wangi halus yang bertahan lebih lama."
    },
    {
      id: "extra-rinse",
      name: "Bilas Tambahan",
      price: 4000,
      description: "Satu siklus pembilasan tambahan."
    },
    {
      id: "special-fabric-care",
      name: "Perawatan Kain Khusus",
      price: 8000,
      description: "Perhatian ekstra untuk pakaian halus."
    }
  ];

  var rupiahFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  });

  var quantityFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 1
  });

  var dateFormatter = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  function getService(id) {
    for (var i = 0; i < SERVICES.length; i += 1) {
      if (SERVICES[i].id === id) {
        return SERVICES[i];
      }
    }
    return null;
  }

  function getVariant(service, variantId) {
    if (!service || !service.variants || !service.variants.length) {
      return null;
    }
    for (var i = 0; i < service.variants.length; i += 1) {
      if (service.variants[i].id === variantId) {
        return service.variants[i];
      }
    }
    return null;
  }

  function getAddon(id) {
    for (var i = 0; i < ADDONS.length; i += 1) {
      if (ADDONS[i].id === id) {
        return ADDONS[i];
      }
    }
    return null;
  }

  function formatRupiah(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return "Rp" + rupiahFormatter.format(Math.round(number));
  }

  function formatQuantity(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) {
      number = 0;
    }
    return quantityFormatter.format(number);
  }

  function formatVariantPrice(variant) {
    if (!variant) {
      return "";
    }
    if (variant.priceMax && variant.priceMax > variant.price) {
      return formatRupiah(variant.price) + "–" + formatRupiah(variant.priceMax);
    }
    return formatRupiah(variant.price);
  }

  function calculateQuote(input) {
    var service = getService(input && input.serviceId);
    if (!service) {
      return null;
    }

    var rawQuantity = input.quantity;
    if (typeof rawQuantity === "string") {
      rawQuantity = rawQuantity.replace(",", ".");
    }
    var requestedQty = Number(rawQuantity);
    if (!Number.isFinite(requestedQty) || requestedQty < 0) {
      requestedQty = 0;
    }

    var validQuantity = requestedQty > 0;
    var minQty = service.minQty || 1;
    var billableQty = validQuantity ? Math.max(requestedQty, minQty) : 0;
    var variant = getVariant(service, input.variantId);
    var unitPrice = variant ? variant.price : service.basePrice;
    var serviceSubtotal = validQuantity ? Math.round(unitPrice * billableQty) : 0;
    var expressApplied = Boolean(input.express) && service.expressEligible && validQuantity;
    var expressFee = expressApplied ? Math.round(serviceSubtotal * 0.5) : 0;
    var addonItems = [];
    var addonSubtotal = 0;
    var addonIds = Array.isArray(input.addonIds) ? input.addonIds : [];

    addonIds.forEach(function (id) {
      var addon = getAddon(id);
      if (addon) {
        addonItems.push(addon);
        addonSubtotal += addon.price;
      }
    });

    if (!validQuantity) {
      addonSubtotal = 0;
    }

    var merchandiseSubtotal = serviceSubtotal + expressFee + addonSubtotal;
    var freeDelivery = validQuantity && merchandiseSubtotal >= config.freeDeliveryFrom;
    var deliveryFee = validQuantity ? (freeDelivery ? 0 : config.deliveryFee) : 0;
    var total = merchandiseSubtotal + deliveryFee;
    var minimumApplied = validQuantity && requestedQty < minQty;
    var quantityLabel = validQuantity
      ? formatQuantity(billableQty) + " " + (billableQty === 1 ? service.unit : service.unitPlural)
      : "";

    return {
      service: service,
      serviceId: service.id,
      serviceName: service.name,
      variant: variant,
      variantId: variant ? variant.id : "",
      variantName: variant ? variant.name : "",
      variantPriceLabel: variant ? formatVariantPrice(variant) : "",
      variantNote: variant && variant.note ? variant.note : "",
      pricingType: service.pricingType,
      unit: service.unit,
      unitPlural: service.unitPlural,
      requestedQty: requestedQty,
      billableQty: billableQty,
      quantityLabel: quantityLabel,
      validQuantity: validQuantity,
      minimumApplied: minimumApplied,
      minQty: minQty,
      unitPrice: unitPrice,
      serviceSubtotal: serviceSubtotal,
      expressApplied: expressApplied,
      expressEligible: service.expressEligible,
      expressFee: expressFee,
      addonItems: addonItems,
      addonSubtotal: addonSubtotal,
      merchandiseSubtotal: merchandiseSubtotal,
      freeDelivery: freeDelivery,
      deliveryFee: deliveryFee,
      total: total,
      turnaround: expressApplied ? service.expressTurnaround : service.turnaround,
      turnaroundLabel: expressApplied
        ? "Express · " + service.expressTurnaround
        : "Reguler · " + service.turnaround
    };
  }

  function getWhatsAppUrl(message) {
    var digits = String(config.whatsappNumber).replace(/\D/g, "");
    var text = message || config.messages.generic;
    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(text);
  }

  function getMapLink() {
    return config.mapUrl || ("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(config.addressQuery));
  }

  function getMapEmbedUrl() {
    return "https://www.google.com/maps?q=" + encodeURIComponent(config.addressQuery) + "&output=embed";
  }

  function getEmailLink() {
    return "mailto:" + config.email;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createReference(prefix) {
    var code = Math.floor(1000 + Math.random() * 9000);
    return "SC-" + (prefix || "EST") + "-" + code;
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function toISODate(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
  }

  function parseISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
      return null;
    }
    var parts = value.split("-");
    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (
      date.getFullYear() !== Number(parts[0]) ||
      date.getMonth() !== Number(parts[1]) - 1 ||
      date.getDate() !== Number(parts[2])
    ) {
      return null;
    }
    return date;
  }

  function addDaysISO(value, days) {
    var date = typeof value === "string" ? parseISODate(value) : new Date(value.getTime());
    if (!date) {
      return "";
    }
    date.setDate(date.getDate() + days);
    return toISODate(date);
  }

  function isClosedDate(value) {
    var date = parseISODate(value);
    return Boolean(date) && config.closedWeekdays.indexOf(date.getDay()) !== -1;
  }

  function getMinPickupDate() {
    return toISODate(new Date());
  }

  function getMaxPickupDate() {
    return addDaysISO(new Date(), config.bookingWindowDays);
  }

  function getSuggestedPickupDate() {
    var candidate = addDaysISO(new Date(), 1);
    for (var i = 0; i < 7; i += 1) {
      if (!isClosedDate(candidate)) {
        return candidate;
      }
      candidate = addDaysISO(candidate, 1);
    }
    return candidate;
  }

  function validatePickupDate(value) {
    if (!value) {
      return "Pilih tanggal penjemputan.";
    }
    var date = parseISODate(value);
    if (!date) {
      return "Pilih tanggal penjemputan yang valid.";
    }
    var today = parseISODate(toISODate(new Date()));
    var maxDate = parseISODate(getMaxPickupDate());
    if (date < today) {
      return "Pilih tanggal mulai hari ini.";
    }
    if (date > maxDate) {
      return "Pilih tanggal dalam " + config.bookingWindowDays + " hari ke depan.";
    }
    if (config.closedWeekdays.indexOf(date.getDay()) !== -1) {
      return "Kami tutup pada hari Minggu. Pilih Senin sampai Sabtu.";
    }
    return "";
  }

  function formatDateID(value) {
    var date = parseISODate(value);
    if (!date) {
      return value || "";
    }
    return dateFormatter.format(date);
  }

  function isAreaAvailable(name) {
    for (var i = 0; i < config.serviceAreas.length; i += 1) {
      if (config.serviceAreas[i].name === name) {
        return config.serviceAreas[i].available;
      }
    }
    return false;
  }

  StarClean.services = SERVICES;
  StarClean.addons = ADDONS;
  StarClean.getService = getService;
  StarClean.getVariant = getVariant;
  StarClean.getAddon = getAddon;
  StarClean.formatRupiah = formatRupiah;
  StarClean.formatQuantity = formatQuantity;
  StarClean.formatVariantPrice = formatVariantPrice;
  StarClean.calculateQuote = calculateQuote;
  StarClean.getWhatsAppUrl = getWhatsAppUrl;
  StarClean.getMapLink = getMapLink;
  StarClean.getMapEmbedUrl = getMapEmbedUrl;
  StarClean.getEmailLink = getEmailLink;
  StarClean.escapeHTML = escapeHTML;
  StarClean.createReference = createReference;
  StarClean.toISODate = toISODate;
  StarClean.parseISODate = parseISODate;
  StarClean.addDaysISO = addDaysISO;
  StarClean.isClosedDate = isClosedDate;
  StarClean.getMinPickupDate = getMinPickupDate;
  StarClean.getMaxPickupDate = getMaxPickupDate;
  StarClean.getSuggestedPickupDate = getSuggestedPickupDate;
  StarClean.validatePickupDate = validatePickupDate;
  StarClean.formatDateID = formatDateID;
  StarClean.isAreaAvailable = isAreaAvailable;
})(window.StarClean = window.StarClean || {});
