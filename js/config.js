(function (StarClean) {
  "use strict";

  StarClean.config = {
    brandName: "Star Clean Laundry",
    whatsappNumber: "62823398889",
    whatsappDisplay: "0823398889",
    email: "",
    instagramDisplay: "",
    instagramUrl: "",
    addressLine1: "Perum BSA, Jl. Kemuning III No.10 Blok-G",
    addressLine2: "Kothe, Kolor, Kec. Kota Sumenep, Kabupaten Sumenep, Jawa Timur 69417",
    addressQuery: "Perum BSA, Jl. Kemuning III No.10 Blok-G, Kothe, Kolor, Kec. Kota Sumenep, Kabupaten Sumenep, Jawa Timur 69417",
    mapUrl: "https://maps.app.goo.gl/BGqSJhHLjWtzR4FK6",
    hours: [
      { day: "Monday", label: "Senin", open: "08.00", close: "20.00", closed: false },
      { day: "Tuesday", label: "Selasa", open: "08.00", close: "20.00", closed: false },
      { day: "Wednesday", label: "Rabu", open: "08.00", close: "20.00", closed: false },
      { day: "Thursday", label: "Kamis", open: "08.00", close: "20.00", closed: false },
      { day: "Friday", label: "Jumat", open: "08.00", close: "20.00", closed: false },
      { day: "Saturday", label: "Sabtu", open: "08.00", close: "18.00", closed: false },
      { day: "Sunday", label: "Minggu", open: "", close: "", closed: true }
    ],
    pickupWindow: "Sen–Sab · 08.00–18.00",
    deliveryWindow: "Sen–Sab · 10.00–20.00",
    pickupFee: "Rp10.000 per pesanan · gratis mulai Rp75.000",
    minimumOrder: "2 kg untuk layanan per kg",
    deliveryFee: 10000,
    freeDeliveryFrom: 75000,
    pickupSlots: [
      "08.00–10.00",
      "10.00–12.00",
      "12.00–14.00",
      "14.00–16.00",
      "16.00–18.00"
    ],
    deliveryPreferences: [
      "Tanpa preferensi",
      "Pagi (10.00–12.00)",
      "Siang (13.00–17.00)",
      "Sore (17.00–20.00)"
    ],
    serviceAreas: [
      { name: "Kolor", available: true },
      { name: "Kota Sumenep", available: true },
      { name: "Batuan", available: false },
      { name: "Lenteng", available: false },
      { name: "Gapura", available: false },
      { name: "Rubaru", available: false },
      { name: "Ganding", available: false },
      { name: "Manding", available: false }
    ],
    draftKey: "starclean.booking.draft.v1",
    draftTtlDays: 7,
    bookingWindowDays: 60,
    closedWeekdays: [0],
    maxInstructions: 500,
    messages: {
      generic: "Halo Star Clean Laundry, saya ingin bertanya tentang layanan dan ketersediaan penjemputan."
    }
  };
})(window.StarClean = window.StarClean || {});
