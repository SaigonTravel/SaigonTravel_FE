# Saigon Travel – Frontend

Website du lịch, teambuilding & MICE (giao diện theo phong cách yanteambuilding.vn) + Admin CMS.

**Stack:** Vite · React 18 · TypeScript · Tailwind CSS · React Router · TanStack Query · Swiper · yet-another-react-lightbox

## Chạy dự án

```bash
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev               # http://localhost:3000
npm run build             # kiểm tra type + build production
```

Backend (`SaigonTravel_BE`) cần chạy trước: `npm run dev`, seed dữ liệu `npm run seed:all`, tạo admin `npm run seed:admin`.

## Cấu trúc

```
src/
  api/          axios client (JWT interceptor) + API theo resource
  types/        kiểu dữ liệu khớp model BE
  hooks/        TanStack Query hooks (public)
  store/        AuthProvider (token localStorage)
  components/   layout (Header/Footer/nút liên hệ nổi), ui, cards, BookingForm, PhotoGrid
  pages/        trang public
  admin/        CMS: layout, trang Tour/Booking/Cấu hình, CRUD cấu hình chung (resources.tsx)
  routes/       router
```

## Trang

| Public | Admin (`/admin`) |
|---|---|
| `/` trang chủ, `/gioi-thieu`, `/tour`, `/tour/:slug`, `/diem-den/:slug`, `/dich-vu(/:slug)`, `/su-kien(/:slug)`, `/hinh-anh(/:slug)`, `/lien-he` | Tổng quan, Booking & tư vấn, Tour, Điểm đến, Danh mục, Dịch vụ, Dự án tiêu biểu, Album ảnh, Cấu hình website |

Phân quyền: `admin`/`manager` quản lý nội dung; `editor`/`sales` chỉ xem Tổng quan và Booking (khớp `authorize()` bên BE).

## Lưu ý

- BE chưa có API upload → các trường ảnh nhập URL.
- Các API list công khai của BE (destinations, categories, services, galleries) lọc `isActive: true`, nên mục bị ẩn cũng không hiện trong CMS.
- `/api/articles`, `/api/testimonials`, `/api/contacts` chưa được mount bên BE → chưa có trang Kiến thức; phần đánh giá khách hàng đang là nội dung tĩnh.
