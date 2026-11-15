(function (FreshFold) {
  "use strict";

  var config = FreshFold.config;
  var services = FreshFold.services;
  var addons = FreshFold.addons;
  var toastStack = document.getElementById("toast-stack");
  var menuOpen = false;
  var menuCloseTimer = null;
  var lastFocusedElement = null;
  var scrollTicking = false;

  function byId(id) {
    return document.getElementById(id);
  }

  function showToast(message, options) {
    if (!toastStack) {
      return;
    }
    var settings = options || {};
    var type = settings.type === "error" ? "error" : "success";
    var duration = Number(settings.duration) || (type === "error" ? 5200 : 3800);
    var toast = document.createElement("div");
    var icon = document.createElement("svg");
    var use = document.createElement("use");
    var text = document.createElement("span");

    toast.className = "toast" + (type === "error" ? " toast--error" : "");
    icon.setAttribute("class", "toast__icon");
    icon.setAttribute("aria-hidden", "true");
    use.setAttribute("href", type === "error" ? "#i-alert" : "#i-check-circle");
    icon.appendChild(use);
    text.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(text);

    while (toastStack.children.length >= 3) {
      toastStack.removeChild(toastStack.firstElementChild);
    }

    toastStack.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add("is-leaving");
      window.setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 220);
    }, duration);
  }

  function initConfig() {
    document.querySelectorAll("[data-config]").forEach(function (element) {
      var key = element.getAttribute("data-config");
      if (key && config[key] !== undefined) {
        element.textContent = config[key];
      }
    });

    document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
      var messageKey = link.getAttribute("data-wa-message") || "generic";
      var message = config.messages[messageKey] || config.messages.generic;
      link.setAttribute("href", FreshFold.getWhatsAppUrl(message));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    document.querySelectorAll("[data-email-link]").forEach(function (link) {
      link.setAttribute("href", FreshFold.getEmailLink());
    });

    document.querySelectorAll("[data-instagram-link]").forEach(function (link) {
      link.setAttribute("href", config.instagramUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    document.querySelectorAll("[data-map-link]").forEach(function (link) {
      link.setAttribute("href", FreshFold.getMapLink());
    });

    var year = byId("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }

    var mapFrame = byId("map-frame");
    if (mapFrame && !mapFrame.querySelector("iframe")) {
      var iframe = document.createElement("iframe");
      iframe.src = FreshFold.getMapEmbedUrl();
      iframe.title = "Peta lokasi studio FreshFold Laundry";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      mapFrame.appendChild(iframe);
    }
  }

  function initHours() {
    var list = byId("hours-list");
    if (!list) {
      return;
    }
    var todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
      new Date().getDay()
    ];
    list.textContent = "";

    config.hours.forEach(function (entry) {
      var row = document.createElement("div");
      var term = document.createElement("dt");
      var detail = document.createElement("dd");

      if (entry.day === todayName) {
        row.className = "is-today";
      }

      term.textContent = entry.label;
      detail.textContent = entry.closed ? "Tutup" : entry.open + "–" + entry.close;
      row.appendChild(term);
      row.appendChild(detail);
      list.appendChild(row);
    });
  }

  function initPrices() {
    document.querySelectorAll("[data-price]").forEach(function (element) {
      var service = FreshFold.getService(element.getAttribute("data-price"));
      if (!service) {
        return;
      }
      element.textContent = (service.showFrom ? "Mulai " : "") + FreshFold.formatRupiah(service.basePrice);
    });

    document.querySelectorAll("[data-turnaround]").forEach(function (element) {
      var service = FreshFold.getService(element.getAttribute("data-turnaround"));
      if (service) {
        element.textContent = service.turnaround;
      }
    });

    document.querySelectorAll("[data-minimum]").forEach(function (element) {
      var service = FreshFold.getService(element.getAttribute("data-minimum"));
      if (service) {
        element.textContent = service.minLabel;
      }
    });

    document.querySelectorAll("[data-delivery-fee]").forEach(function (element) {
      element.textContent = FreshFold.formatRupiah(config.deliveryFee);
    });

    document.querySelectorAll("[data-delivery-free-from]").forEach(function (element) {
      element.textContent = FreshFold.formatRupiah(config.freeDeliveryFrom);
    });
  }

  function initPriceTables() {
    var weightBody = byId("price-kg-body");
    if (weightBody) {
      weightBody.textContent = "";
      services.forEach(function (service) {
        if (service.pricingType !== "weight") {
          return;
        }
        var row = document.createElement("tr");
        var name = document.createElement("td");
        var rate = document.createElement("td");
        var time = document.createElement("td");
        var unit = document.createElement("span");

        name.textContent = service.name;
        rate.textContent = FreshFold.formatRupiah(service.basePrice) + " ";
        unit.className = "unit";
        unit.textContent = "/kg";
        rate.appendChild(unit);
        time.textContent = service.turnaround;
        row.appendChild(name);
        row.appendChild(rate);
        row.appendChild(time);
        weightBody.appendChild(row);
      });
    }

    var itemGroups = byId("price-item-groups");
    if (itemGroups) {
      itemGroups.textContent = "";
      services.forEach(function (service) {
        if (service.pricingType !== "item" || !service.variants.length) {
          return;
        }
        var group = document.createElement("div");
        var heading = document.createElement("h4");
        var from = document.createElement("span");
        var list = document.createElement("ul");

        group.className = "price-item-group";
        heading.textContent = service.name;
        from.textContent = "mulai " + FreshFold.formatRupiah(service.basePrice);
        heading.appendChild(from);

        service.variants.forEach(function (variant) {
          var item = document.createElement("li");
          var label = document.createElement("span");
          var price = document.createElement("span");
          label.textContent = variant.name;
          price.textContent = FreshFold.formatRupiah(variant.price);
          item.appendChild(label);
          item.appendChild(price);
          list.appendChild(item);
        });

        group.appendChild(heading);
        group.appendChild(list);
        itemGroups.appendChild(group);
      });
    }

    var addonList = byId("addon-price-list");
    if (addonList) {
      addonList.textContent = "";
      addons.forEach(function (addon) {
        var item = document.createElement("li");
        var label = document.createElement("span");
        var price = document.createElement("span");
        label.textContent = addon.name;
        price.textContent = FreshFold.formatRupiah(addon.price);
        item.appendChild(label);
        item.appendChild(price);
        addonList.appendChild(item);
      });
    }
  }

  function initAreas() {
    var chipList = byId("served-areas");
    if (chipList) {
      chipList.textContent = "";
      config.serviceAreas.forEach(function (area) {
        if (!area.available) {
          return;
        }
        var chip = document.createElement("li");
        chip.textContent = area.name;
        chipList.appendChild(chip);
      });
    }

    var areaSelect = byId("area-select");
    if (areaSelect) {
      if (!areaSelect.querySelector('option[value=""]')) {
        var placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Pilih area";
        areaSelect.appendChild(placeholder);
      }

      var availableGroup = document.createElement("optgroup");
      availableGroup.label = "Area layanan";
      var outsideGroup = document.createElement("optgroup");
      outsideGroup.label = "Di luar area demo";

      config.serviceAreas.forEach(function (area) {
        var option = document.createElement("option");
        option.value = area.name;
        option.textContent = area.name;
        if (area.available) {
          availableGroup.appendChild(option);
        } else {
          outsideGroup.appendChild(option);
        }
      });

      areaSelect.appendChild(availableGroup);
      areaSelect.appendChild(outsideGroup);
    }

    var district = byId("district");
    if (district) {
      var districtPlaceholder = document.createElement("option");
      districtPlaceholder.value = "";
      districtPlaceholder.textContent = "Pilih kecamatan";
      district.appendChild(districtPlaceholder);

      config.serviceAreas.forEach(function (area) {
        if (!area.available) {
          return;
        }
        var option = document.createElement("option");
        option.value = area.name;
        option.textContent = area.name;
        district.appendChild(option);
      });
    }

    var result = byId("area-result");
    if (areaSelect && result) {
      areaSelect.addEventListener("change", function () {
        var selected = areaSelect.value;
        if (!selected) {
          result.hidden = true;
          result.textContent = "";
          return;
        }

        var available = FreshFold.isAreaAvailable(selected);
        result.hidden = false;
        result.classList.toggle("is-unserved", !available);
        result.textContent = "";

        var title = document.createElement("strong");
        var copy = document.createElement("span");
        var action = document.createElement("a");

        if (available) {
          title.textContent = "Penjemputan tersedia di " + selected + ".";
          copy.textContent = " Lanjutkan ke formulir pemesanan untuk memilih waktu penjemputan.";
          action.href = "#booking";
          action.textContent = "Pesan penjemputan";
          var districtField = byId("district");
          if (districtField) {
            districtField.value = selected;
          }
        } else {
          title.textContent = selected + " berada di luar cakupan demo kami.";
          copy.textContent = " Kirim pesan kepada kami dan kami akan memeriksa apakah ada pengecualian.";
          action.href = FreshFold.getWhatsAppUrl(
            "Halo FreshFold Laundry, apakah penjemputan tersedia di area " + selected + "?"
          );
          action.target = "_blank";
          action.rel = "noopener noreferrer";
          action.textContent = "Tanya via WhatsApp";
        }

        result.appendChild(title);
        result.appendChild(copy);
        result.appendChild(action);
      });
    }
  }

  function initPickupOptions() {
    var slot = byId("pickup-slot");
    if (slot) {
      var slotPlaceholder = document.createElement("option");
      slotPlaceholder.value = "";
      slotPlaceholder.textContent = "Pilih waktu";
      slot.appendChild(slotPlaceholder);
      config.pickupSlots.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        slot.appendChild(option);
      });
    }

    var delivery = byId("delivery-preference");
    if (delivery) {
      config.deliveryPreferences.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        delivery.appendChild(option);
      });
    }

    var date = byId("pickup-date");
    if (date) {
      date.min = FreshFold.getMinPickupDate();
      date.max = FreshFold.getMaxPickupDate();
      if (!date.value) {
        date.value = FreshFold.getSuggestedPickupDate();
      }
    }
  }

  function setMenu(open) {
    var toggle = byId("nav-toggle");
    var menu = byId("mobile-menu");
    if (!toggle || !menu) {
      return;
    }

    window.clearTimeout(menuCloseTimer);

    if (open) {
      if (menuOpen) {
        return;
      }
      lastFocusedElement = document.activeElement;
      menu.hidden = false;
      menuOpen = true;
      document.body.classList.add("menu-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Tutup menu");

      window.requestAnimationFrame(function () {
        menu.classList.add("is-open");
        var firstLink = menu.querySelector("a");
        if (firstLink) {
          firstLink.focus({ preventScroll: true });
        }
      });
      return;
    }

    if (!menuOpen) {
      return;
    }

    menuOpen = false;
    document.body.classList.remove("menu-open");
    menu.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Buka menu");

    menuCloseTimer = window.setTimeout(function () {
      menu.hidden = true;
    }, 300);

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function initMenu() {
    var toggle = byId("nav-toggle");
    var menu = byId("mobile-menu");
    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("click", function (event) {
      if (!menuOpen) {
        return;
      }
      if (menu.contains(event.target) || toggle.contains(event.target)) {
        return;
      }
      setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!menuOpen) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a, button")));
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktop = window.matchMedia("(min-width: 1021px)");
    var handleDesktop = function (event) {
      if (event.matches && menuOpen) {
        setMenu(false);
      }
    };
    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", handleDesktop);
    } else if (typeof desktop.addListener === "function") {
      desktop.addListener(handleDesktop);
    }
  }

  function initScrollUI() {
    var header = byId("site-header");
    var backToTop = byId("back-to-top");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".primary-nav .nav-link"));
    var sections = navLinks
      .map(function (link) {
        var href = link.getAttribute("href");
        return href ? document.querySelector(href) : null;
      })
      .filter(Boolean);

    function update() {
      var scrollY = window.scrollY || window.pageYOffset;

      if (header) {
        header.classList.toggle("is-scrolled", scrollY > 8);
      }
      if (backToTop) {
        backToTop.classList.toggle("is-visible", scrollY > 600);
      }

      var offset = scrollY + 150;
      var currentId = "home";
      sections.forEach(function (section) {
        if (section.offsetTop <= offset) {
          currentId = section.id;
        }
      });

      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + currentId) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      scrollTicking = false;
    }

    function onScroll() {
      if (scrollTicking) {
        return;
      }
      scrollTicking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    if (backToTop) {
      backToTop.addEventListener("click", function () {
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }
  }

  function initAccordion() {
    var accordion = byId("faq-accordion");
    if (!accordion) {
      return;
    }

    var triggers = Array.prototype.slice.call(accordion.querySelectorAll(".accordion__trigger"));

    triggers.forEach(function (trigger) {
      var panel = byId(trigger.getAttribute("aria-controls"));
      if (!panel) {
        return;
      }
      panel.style.height = "0px";
      panel.setAttribute("aria-hidden", "true");

      trigger.addEventListener("click", function () {
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        triggers.forEach(function (other) {
          if (other === trigger) {
            return;
          }
          var otherPanel = byId(other.getAttribute("aria-controls"));
          if (!otherPanel || other.getAttribute("aria-expanded") !== "true") {
            return;
          }
          other.setAttribute("aria-expanded", "false");
          otherPanel.style.height = otherPanel.scrollHeight + "px";
          otherPanel.setAttribute("aria-hidden", "true");
          window.requestAnimationFrame(function () {
            otherPanel.style.height = "0px";
          });
        });

        if (isOpen) {
          trigger.setAttribute("aria-expanded", "false");
          panel.style.height = panel.scrollHeight + "px";
          panel.setAttribute("aria-hidden", "true");
          window.requestAnimationFrame(function () {
            panel.style.height = "0px";
          });
          return;
        }

        trigger.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        panel.style.height = panel.scrollHeight + "px";
      });

      panel.addEventListener("transitionend", function (event) {
        if (event.propertyName === "height" && trigger.getAttribute("aria-expanded") === "true") {
          panel.style.height = "auto";
        }
      });
    });
  }

  function initReveal() {
    var elements = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!elements.length) {
      return;
    }

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("is-revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          var delay = Number(entry.target.getAttribute("data-reveal-delay")) || 0;
          if (delay) {
            entry.target.style.transitionDelay = delay + "ms";
          }
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -7% 0px" }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function initDraftBridge() {
    var footerClear = byId("footer-clear-draft");
    if (!footerClear) {
      return;
    }
    footerClear.addEventListener("click", function () {
      document.dispatchEvent(new CustomEvent("freshfold:clear-draft", { detail: { source: "footer" } }));
    });
  }

  FreshFold.ui = {
    showToast: showToast
  };

  initConfig();
  initHours();
  initPrices();
  initPriceTables();
  initAreas();
  initPickupOptions();
  initMenu();
  initScrollUI();
  initAccordion();
  initReveal();
  initDraftBridge();
})(window.FreshFold = window.FreshFold || {});
