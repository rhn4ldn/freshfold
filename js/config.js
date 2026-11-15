(function (FreshFold) {
  "use strict";

  FreshFold.config = {
    brandName: "FreshFold Laundry",
    whatsappNumber: "6281234567890",
    whatsappDisplay: "+62 812-3456-7890",
    email: "hello@freshfold.example",
    instagramDisplay: "@freshfold.demo",
    instagramUrl: "https://instagram.com/freshfold.demo",
    addressLine1: "Jl. Melati Raya No. 12",
    addressLine2: "Kebayoran Baru, Jakarta Selatan 12130",
    addressQuery: "Jl. Melati Raya No. 12, Kebayoran Baru, Jakarta Selatan 12130",
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
      { name: "Kebayoran Baru", available: true },
      { name: "Cilandak", available: true },
      { name: "Pasar Minggu", available: true },
      { name: "Tebet", available: true },
      { name: "Setiabudi", available: true },
      { name: "Depok", available: false },
      { name: "Bekasi", available: false },
      { name: "Tangerang", available: false },
      { name: "Bogor", available: false }
    ],
    draftKey: "freshfold.booking.draft.v1",
    draftTtlDays: 7,
    bookingWindowDays: 60,
    closedWeekdays: [0],
    maxInstructions: 500,
    messages: {
      generic: "Halo FreshFold Laundry, saya ingin bertanya tentang layanan dan ketersediaan penjemputan."
    }
  };
})(window.FreshFold = window.FreshFold || {});
