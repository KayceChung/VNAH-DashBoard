/**
 * Approximate centroid coordinates for Vietnam's 63 provinces/cities, keyed
 * by the standard 2-digit GSO administrative code (matches `provinces.code`
 * in the database — confirmed against live data, e.g. "1" = Hà Nội,
 * "79" = TP Hồ Chí Minh, "92" = Cần Thơ). Coordinates are approximate
 * (province-level, not precise boundaries) — good enough to place a bubble
 * marker per province on a map, not for boundary-accurate GIS work.
 */
export const VN_PROVINCE_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "1": { lat: 21.03, lng: 105.85 }, // Hà Nội
  "2": { lat: 22.83, lng: 104.98 }, // Hà Giang
  "4": { lat: 22.67, lng: 106.25 }, // Cao Bằng
  "6": { lat: 22.15, lng: 105.83 }, // Bắc Kạn
  "8": { lat: 22.15, lng: 105.22 }, // Tuyên Quang
  "10": { lat: 22.35, lng: 104.15 }, // Lào Cai
  "11": { lat: 21.55, lng: 103.05 }, // Điện Biên
  "12": { lat: 22.35, lng: 103.15 }, // Lai Châu
  "14": { lat: 21.15, lng: 103.9 }, // Sơn La
  "15": { lat: 21.7, lng: 104.6 }, // Yên Bái
  "17": { lat: 20.75, lng: 105.2 }, // Hòa Bình
  "19": { lat: 21.6, lng: 105.83 }, // Thái Nguyên
  "20": { lat: 21.85, lng: 106.75 }, // Lạng Sơn
  "22": { lat: 21.1, lng: 107.3 }, // Quảng Ninh
  "24": { lat: 21.3, lng: 106.6 }, // Bắc Giang
  "25": { lat: 21.35, lng: 105.15 }, // Phú Thọ
  "26": { lat: 21.35, lng: 105.55 }, // Vĩnh Phúc
  "27": { lat: 21.15, lng: 106.05 }, // Bắc Ninh
  "30": { lat: 20.95, lng: 106.35 }, // Hải Dương
  "31": { lat: 20.85, lng: 106.7 }, // Hải Phòng
  "33": { lat: 20.85, lng: 106.05 }, // Hưng Yên
  "34": { lat: 20.5, lng: 106.35 }, // Thái Bình
  "35": { lat: 20.55, lng: 105.95 }, // Hà Nam
  "36": { lat: 20.3, lng: 106.2 }, // Nam Định
  "37": { lat: 20.25, lng: 105.95 }, // Ninh Bình
  "38": { lat: 19.9, lng: 105.4 }, // Thanh Hóa
  "40": { lat: 19.15, lng: 104.9 }, // Nghệ An
  "42": { lat: 18.35, lng: 105.6 }, // Hà Tĩnh
  "44": { lat: 17.5, lng: 106.35 }, // Quảng Bình
  "45": { lat: 16.75, lng: 106.9 }, // Quảng Trị
  "46": { lat: 16.3, lng: 107.6 }, // Huế
  "48": { lat: 16.05, lng: 108.2 }, // Đà Nẵng
  "49": { lat: 15.5, lng: 108.0 }, // Quảng Nam
  "51": { lat: 15.1, lng: 108.6 }, // Quảng Ngãi
  "52": { lat: 14.0, lng: 108.9 }, // Bình Định
  "54": { lat: 13.1, lng: 109.1 }, // Phú Yên
  "56": { lat: 12.25, lng: 109.05 }, // Khánh Hòa
  "58": { lat: 11.65, lng: 108.85 }, // Ninh Thuận
  "60": { lat: 11.1, lng: 108.25 }, // Bình Thuận
  "62": { lat: 14.65, lng: 107.9 }, // Kon Tum
  "64": { lat: 13.8, lng: 108.25 }, // Gia Lai
  "66": { lat: 12.8, lng: 108.25 }, // Đắk Lắk
  "67": { lat: 12.15, lng: 107.65 }, // Đắk Nông
  "68": { lat: 11.85, lng: 108.15 }, // Lâm Đồng
  "70": { lat: 11.75, lng: 106.9 }, // Bình Phước
  "72": { lat: 11.35, lng: 106.15 }, // Tây Ninh
  "74": { lat: 11.15, lng: 106.65 }, // Bình Dương
  "75": { lat: 11.1, lng: 107.2 }, // Đồng Nai
  "77": { lat: 10.55, lng: 107.35 }, // Bà Rịa - Vũng Tàu
  "79": { lat: 10.78, lng: 106.65 }, // TP Hồ Chí Minh
  "80": { lat: 10.65, lng: 106.15 }, // Long An
  "82": { lat: 10.4, lng: 106.35 }, // Tiền Giang
  "83": { lat: 10.25, lng: 106.4 }, // Bến Tre
  "84": { lat: 9.8, lng: 106.3 }, // Trà Vinh
  "86": { lat: 10.15, lng: 105.95 }, // Vĩnh Long
  "87": { lat: 10.55, lng: 105.65 }, // Đồng Tháp
  "89": { lat: 10.4, lng: 105.15 }, // An Giang
  "91": { lat: 9.9, lng: 105.1 }, // Kiên Giang
  "92": { lat: 10.05, lng: 105.75 }, // TP Cần Thơ
  "93": { lat: 9.75, lng: 105.6 }, // Hậu Giang
  "94": { lat: 9.55, lng: 105.9 }, // Sóc Trăng
  "95": { lat: 9.3, lng: 105.7 }, // Bạc Liêu
  "96": { lat: 9.05, lng: 105.1 }, // Cà Mau
};
