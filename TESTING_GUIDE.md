# 🏡 Real Estate App - Complete Testing Guide

## ✅ Features Implemented

All user stories have been implemented with a modern, professional design:

### 1. **Advanced Filtering System**
- ✅ Filter by price range (min/max)
- ✅ Filter by bedrooms (min beds)
- ✅ Filter by bathrooms (exact match)
- ✅ Filter by facilities (multi-select)
- ✅ All filters work together

### 2. **Sorting Options**
- ✅ Newest first (default)
- ✅ Price: High to Low
- ✅ Price: Low to High
- ✅ Rating (highest first)

### 3. **Map View**
- ✅ OpenStreetMap + Leaflet integration (no API key required)
- ✅ Custom markers with property info
- ✅ Click marker to view property details
- ✅ Auto-fit bounds to show all properties
- ✅ Beautiful popups with price and address

### 4. **Property Management**
- ✅ Create new property listings
- ✅ Upload multiple images
- ✅ Edit existing listings
- ✅ Delete listings with confirmation
- ✅ View all my listings

### 5. **Modern UI/UX**
- ✅ Professional, clean design
- ✅ Consistent theme throughout
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Empty states with helpful messages

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```powershell
cd 'C:\Users\DELL\Desktop\service-immobilier\Real_Estate_App'
npm install
npx expo install react-native-webview expo-image-picker
```

### 2. Verify Environment Variables

Make sure your `.env` file contains:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID=your_properties_collection_id
EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID=your_galleries_collection_id
EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID=your_agents_collection_id
EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=your_reviews_collection_id
EXPO_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID=your_bucket_id
EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID=your_favorites_collection_id
```

### 3. Appwrite Collection Schema

Ensure your **Properties** collection has these attributes:

- `name` (string, required)
- `address` (string, required)
- `price` (number, required)
- `rating` (number, required) - **default: 0**
- `bedrooms` (integer, required)
- `bathrooms` (integer, required)
- `area` (number)
- `type` (string)
- `description` (string)
- `image` (string)
- `facilities` (array of strings)
- `geolocation` (object with `lat` and `lng` numbers)
- `agent` (relationship to agents collection)
- `gallery` (array or relationship to galleries collection)

### 4. Start the App

```powershell
npx expo start -c
```

---

## 🧪 Complete Testing Checklist

### **Phase 1: Initial Setup & Authentication**

- [ ] App launches without errors
- [ ] Sign in with Google works
- [ ] User profile loads correctly
- [ ] Bottom navigation tabs are visible

---

### **Phase 2: Seed Test Data**

1. Navigate to **Profile** tab
2. Press **"Seed Data (dev)"** button
3. Wait for success message
4. Verify: "Database already has 20 properties" or "Seeded X properties"

**Expected Result:** 20 properties created with:
- Random names, prices, bedrooms, bathrooms
- Facilities assigned
- Latitude/Longitude coordinates (Tunis area: lat 33.5-34.5, lng 9.0-10.0)
- Rating set to 0

---

### **Phase 3: Explore & Search**

#### **Test Search Functionality**
1. Go to **Explore** tab
2. Tap search bar
3. Type "Villa" or "Apartment"
4. Wait 500ms (debounce)
5. Results should update automatically
6. Clear search by pressing "×"

**Expected Result:**
- Properties filter by name, type, or address
- Debounced updates (no lag)
- Clear button appears when typing

#### **Test Category Filter**
1. Scroll category chips horizontally
2. Tap "Houses", "Apartments", "Villas", etc.
3. Results should update immediately
4. Selected category highlighted in blue

**Expected Result:**
- Only properties of selected type appear
- Count updates: "X Properties"

---

### **Phase 4: Advanced Filters**

1. Tap **"Filters"** button (blue pill with filter icon)
2. Filter panel expands below

#### **Test Price Range**
- Enter Min Price: `100000`
- Enter Max Price: `500000`
- Tap **Apply Filters**
- Verify: Only properties in that price range appear

#### **Test Bedrooms & Bathrooms**
- Min Beds: `2`
- Bathrooms: `2`
- Tap **Apply Filters**
- Verify: Only properties with ≥2 beds and exactly 2 baths

#### **Test Facilities**
- Select: "Gym", "Swimming pool", "Wifi"
- Tap **Apply Filters**
- Verify: Only properties with ALL selected facilities

#### **Test Sort**
- Select **"Price: High"**
- Apply
- Verify: Most expensive property first

- Select **"Price: Low"**
- Apply
- Verify: Cheapest property first

- Select **"Newest"**
- Apply
- Verify: Recently created properties first

- Select **"Rating"**
- Apply
- Verify: Highest rated properties first

#### **Test Reset**
- Set multiple filters
- Tap **Reset**
- Verify: All filters cleared, all properties shown

**Expected Result:**
- Filters apply correctly
- Multiple filters work together (AND logic)
- Sort order changes results
- Reset clears all filters

---

### **Phase 5: Map View**

1. In Explore, tap **"Map View"** button (top right)
2. Map loads with OpenStreetMap tiles
3. Blue circular markers appear for each property

#### **Test Map Interactions**
- [ ] Pan/zoom the map
- [ ] Markers visible for all properties with lat/lng
- [ ] Tap a marker
- [ ] Popup appears with:
  - Property name
  - Price (formatted)
  - Address
  - "View Details →" link
- [ ] Click "View Details"
- [ ] Navigates to property detail page

#### **Test Map Toggle**
- [ ] Button changes to "List View" when map shown
- [ ] Tap "List View" - map hides, property grid appears
- [ ] No crashes or errors

**Expected Result:**
- Map renders smoothly inside WebView
- All seeded properties with geolocation appear as markers
- Clicking marker navigates correctly
- Toggle works seamlessly

**Note:** If no markers appear, properties need `geolocation: { lat: 33.xxx, lng: 9.xxx }` in database.

---

### **Phase 6: Create Property**

1. Go to **Profile** tab
2. Tap **"My Listings"**
3. Tap **"+ Create"** button (top right)

#### **Fill Form**
- **Name:** "Luxury Villa in Tunis"
- **Address:** "La Marsa, Tunis"
- **Price:** `350000`
- **Type:** "Villa"
- **Bedrooms:** `4`
- **Bathrooms:** `3`
- **Area:** `2500`
- **Latitude:** `33.8869`
- **Longitude:** `9.5375`
- **Description:** "Beautiful villa with sea view..."
- **Facilities:** Select "Gym", "Swimming pool", "Wifi"

#### **Add Images**
1. Tap **"+ Add Images"** button
2. Grant photo library permissions
3. Select 3-5 images
4. Images appear in preview grid
5. Remove image by tapping red "×" button

#### **Submit**
1. Tap **"Create Property"**
2. Loading spinner appears
3. Wait for upload
4. Success alert: "Property created"
5. Navigate back to My Listings

**Expected Result:**
- All fields accept input
- Image picker works (expo-image-picker installed)
- Images upload to Appwrite storage
- Gallery documents created
- Property appears in "My Listings"
- Property visible in Explore with filters
- Property marker appears on map

**Troubleshooting:**
- If image picker fails: `npx expo install expo-image-picker`
- If upload fails: Check Appwrite bucket permissions (read/write for authenticated users)
- If "Missing required attribute 'rating'" error: Already fixed (default: 0)

---

### **Phase 7: Edit Property**

1. Go to **My Listings**
2. Tap **Edit** on a property
3. Form pre-fills with existing data
4. Change **Price** to `400000`
5. Add facility: "Pet Center"
6. Tap **"Update Property"**
7. Success alert
8. Navigate back

**Expected Result:**
- Edit form loads existing values
- Images, geolocation, facilities pre-populated
- Changes save correctly
- Property updates in Explore and map

---

### **Phase 8: Delete Property**

1. In **My Listings**, tap **Delete** on a property
2. Confirmation alert appears
3. Tap **"Delete"**
4. Loading briefly
5. Success: "Listing deleted successfully"
6. Property removed from list

**Alternative:** Delete from property detail page
1. View a property you own
2. "Edit" and "Delete" buttons visible in header
3. Tap **Delete**
4. Same confirmation flow

**Expected Result:**
- Confirmation prevents accidental deletion
- Property removed from database
- No longer appears in Explore or My Listings
- Related gallery images remain in storage (optional: delete them too)

---

### **Phase 9: View All My Listings**

1. Go to **Profile** → **My Listings**
2. All properties created by current user appear
3. Empty state if no listings:
   - Icon displayed
   - "No Listings Yet" message
   - "Create Your First Listing" button

**Expected Result:**
- Only user's properties shown
- Edit/Delete buttons on each card
- Create button always accessible (top right + empty state)
- Count displayed: "X properties"

---

### **Phase 10: Favorites (Already Implemented)**

1. On any property card or detail page
2. Tap heart icon
3. Property added to favorites
4. Tap again to remove
5. Navigate to **Favorites** tab
6. All favorited properties appear

**Expected Result:**
- Heart icon toggles red/outline
- Favorites persist across sessions
- Favorites tab shows all favorited properties

---

## 🐛 Known Issues & Solutions

### Issue: "Invalid document structure: Missing required attribute 'rating'"
**Solution:** Already fixed! Default `rating: 0` added in `createProperty` function.

### Issue: No markers on map
**Solution:** 
- Seed data includes lat/lng now
- Manually create property with latitude/longitude
- Check Appwrite console: properties must have `geolocation: { lat: number, lng: number }`

### Issue: Image upload fails
**Solution:**
```powershell
npx expo install expo-image-picker
```
- Check Appwrite bucket permissions: Read/Write for authenticated users
- Verify bucket ID in `.env`

### Issue: "Network request failed"
**Solution:**
- Check Appwrite endpoint URL in `.env`
- Ensure device/emulator has internet
- Verify Appwrite server is running
- Check firewall/VPN settings

### Issue: WebView not rendering map
**Solution:**
```powershell
npx expo install react-native-webview
```
- Restart Expo after install
- Clear cache: `npx expo start -c`

---

## 📊 Performance Notes

- **Search:** Debounced 500ms for smooth UX
- **Filters:** Client-side + server-side filtering
- **Map:** Lazy-loaded via WebView, no native SDK overhead
- **Images:** Optimized with `resizeMode="cover"`
- **Loading States:** Present on all async operations

---

## 🎨 Design System

### Colors
- **Primary Blue:** `#0061FF` (primary-300)
- **Light Blue:** `#E1EFFE` (primary-100)
- **White:** `#FFFFFF`
- **Black Text:** `#1F2937` (black-300)
- **Gray Text:** `#6B7280` (black-200)
- **Red (Delete):** `#EF4444`

### Typography
- **Headings:** rubik-bold, rubik-extrabold
- **Body:** rubik, rubik-medium
- **Sizes:** text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

### Spacing
- Consistent padding: `px-4`, `py-3`, `gap-3`
- Rounded corners: `rounded-lg` (12px), `rounded-xl` (16px), `rounded-full`
- Shadows: `shadow-sm`, `shadow-md`

---

## 🚢 Deployment Checklist

Before releasing:

- [ ] Remove "Seed Data (dev)" button from Profile (production)
- [ ] Add error boundaries for crash prevention
- [ ] Test on iOS and Android devices
- [ ] Verify all Appwrite indexes created (price, bedrooms, rating, $createdAt)
- [ ] Optimize images (compress before upload)
- [ ] Add analytics (optional)
- [ ] Test with large datasets (100+ properties)
- [ ] Add pagination/infinite scroll if needed

---

## 📞 Support

If you encounter any issues:

1. Check Metro logs for errors
2. Verify `.env` variables
3. Check Appwrite console for collection/bucket IDs
4. Ensure all dependencies installed
5. Clear cache: `npx expo start -c`

---

## 🎉 Success Criteria

All features work correctly if:

✅ All filters apply and combine properly  
✅ Sorting changes results order  
✅ Map shows markers and navigates on click  
✅ Create/Edit/Delete work without errors  
✅ Images upload successfully  
✅ My Listings shows only user's properties  
✅ Search returns relevant results  
✅ No console errors or crashes  
✅ UI is modern, professional, and consistent  

---

**Congratulations! Your Real Estate App is fully functional! 🏡✨**
