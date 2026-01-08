# 🔐 Authentication & Route Protection

## ✅ Implementasi Lengkap

Sistem autentikasi dan proteksi route untuk admin panel telah berhasil diimplementasikan!

---

## 🎯 Fitur Authentication

### 1. **Protected Routes**
Semua halaman admin sekarang dilindungi dengan authentication check:
- ✅ `/admin` - Protected
- ✅ `/admin/dashboard` - Protected
- ✅ `/admin/menus` - Protected
- ✅ `/admin/tables` - Protected
- ✅ `/admin/reservations` - Protected

### 2. **Auto Redirect**
- **Belum Login** → Akses halaman admin → Redirect ke `/admin/login`
- **Sudah Login** → Akses `/admin/login` → Redirect ke `/admin/dashboard`

### 3. **Loading States**
- Menampilkan loading spinner saat mengecek status autentikasi
- Mencegah flash of unauthenticated content

---

## 📁 File yang Dibuat/Diupdate

### **Baru:**
1. **`src/components/auth/ProtectedRoute.tsx`**
   - Component untuk melindungi routes
   - Mengecek `isAuthenticated` dari AuthContext
   - Redirect ke login jika belum terautentikasi
   - Menampilkan loading state

### **Updated:**
1. **`src/App.tsx`**
   - Import `ProtectedRoute`
   - Wrap `AppLayout` dengan `ProtectedRoute`
   - Semua admin routes sekarang protected

2. **`src/pages/Admin/AdminLogin.tsx`**
   - Tambah check autentikasi
   - Redirect ke dashboard jika sudah login
   - Menampilkan loading state

---

## 🔄 Authentication Flow

### **Scenario 1: User Belum Login**
```
1. User akses /admin/dashboard
2. ProtectedRoute check isAuthenticated → false
3. Redirect ke /admin/login
4. User login dengan username & password
5. Token disimpan ke localStorage
6. User state updated di AuthContext
7. Redirect ke /admin/dashboard
8. ProtectedRoute check isAuthenticated → true
9. Dashboard ditampilkan
```

### **Scenario 2: User Sudah Login**
```
1. User akses /admin/dashboard
2. ProtectedRoute check isAuthenticated → true
3. Dashboard langsung ditampilkan
```

### **Scenario 3: User Sudah Login, Akses Login Page**
```
1. User akses /admin/login
2. AdminLogin check isAuthenticated → true
3. Redirect ke /admin/dashboard
```

### **Scenario 4: User Logout**
```
1. User klik logout
2. Token dihapus dari localStorage
3. User state di-reset di AuthContext
4. Redirect ke /admin/login
```

---

## 💻 Code Implementation

### **ProtectedRoute Component**
```tsx
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
}
```

### **Usage in App.tsx**
```tsx
<Route
  element={
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  }
>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  {/* ... other admin routes */}
</Route>
```

### **AdminLogin with Redirect**
```tsx
export default function AdminLogin() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ... render login form
}
```

---

## 🔑 AuthContext API

### **State:**
- `user`: User object atau null
- `isAuthenticated`: Boolean (true jika user login)
- `isLoading`: Boolean (true saat checking auth)

### **Methods:**
- `login(user, token)`: Set user & token
- `logout()`: Clear user & token
- `checkAuth()`: Verify token validity

---

## 🧪 Testing Checklist

### **Test 1: Access Protected Route (Not Logged In)**
1. ✅ Clear localStorage
2. ✅ Akses `http://localhost:5173/admin/dashboard`
3. ✅ Harus redirect ke `/admin/login`

### **Test 2: Login Flow**
1. ✅ Akses `/admin/login`
2. ✅ Input username & password
3. ✅ Klik "Masuk"
4. ✅ Harus redirect ke `/admin/dashboard`

### **Test 3: Access Login When Logged In**
1. ✅ Login terlebih dahulu
2. ✅ Akses `/admin/login`
3. ✅ Harus redirect ke `/admin/dashboard`

### **Test 4: Logout Flow**
1. ✅ Login terlebih dahulu
2. ✅ Klik logout (di sidebar/header)
3. ✅ Harus redirect ke `/admin/login`
4. ✅ Token harus dihapus dari localStorage

### **Test 5: Page Refresh**
1. ✅ Login terlebih dahulu
2. ✅ Refresh halaman dashboard
3. ✅ Harus tetap login (token di localStorage)
4. ✅ Dashboard tetap ditampilkan

### **Test 6: Invalid Token**
1. ✅ Set invalid token di localStorage
2. ✅ Akses `/admin/dashboard`
3. ✅ Harus redirect ke `/admin/login`

---

## 🎨 Loading States

### **ProtectedRoute Loading:**
```tsx
<div className="flex min-h-screen items-center justify-center">
  <div className="text-center">
    <div className="animate-spin rounded-full border-4 border-brand-500"></div>
    <p className="mt-4">Memuat...</p>
  </div>
</div>
```

### **AdminLogin Loading:**
- Same loading UI saat checking auth
- Prevents flash of login form jika sudah login

---

## 🔒 Security Features

### **1. Token Storage**
- Token disimpan di `localStorage`
- Key: `auth_token`
- Auto-included dalam API requests

### **2. Token Validation**
- Check token validity on app mount
- API call ke `/api/auth/me`
- Invalid token → auto logout

### **3. Protected API Calls**
- Semua admin API calls include `Authorization` header
- Format: `Bearer {token}`

### **4. Route Guards**
- Client-side protection dengan `ProtectedRoute`
- Server-side protection di backend (Laravel Sanctum)

---

## 📝 Notes

### **Persistent Login:**
Token disimpan di localStorage, jadi user tetap login setelah refresh page.

### **Auto Logout:**
Jika token invalid/expired, user akan auto-redirect ke login.

### **Loading UX:**
Loading states mencegah flash of wrong content dan memberikan feedback ke user.

---

## 🎉 Summary

✅ **Protected Routes** - Semua admin routes dilindungi  
✅ **Auto Redirect** - Smart navigation based on auth status  
✅ **Loading States** - Smooth UX saat checking auth  
✅ **Token Management** - Persistent login dengan localStorage  
✅ **Security** - Client & server-side protection  

**Authentication system siap digunakan!** 🚀
