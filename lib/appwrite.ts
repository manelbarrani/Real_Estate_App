// Use the React Native SDK to enable cookie fallbacks and mobile OAuth helpers
import { PropertyDocument } from "@/components/Cards";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import { Platform } from "react-native";
import { Account, Avatars, Client, Databases, ID, OAuthProvider, Query, Storage } from "react-native-appwrite";
export const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
  agentsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  propertiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID,
  profileImagesBucketId: process.env.EXPO_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || "profile-images",
  favoritesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || "favorites",
};

// Determine correct platform identifier for Appwrite origin validation.
// Expo Go uses host.exp.Exponent (iOS) / host.exp.exponent (Android).
const isExpoGo = (Constants as any)?.appOwnership === 'expo';
// Expo Go identifies as 'host.exp.exponent' on both platforms for Appwrite's origin check
const iosBundleId = isExpoGo ? 'host.exp.exponent' : 'com.jsm.restate';
const androidPackage = isExpoGo ? 'host.exp.exponent' : 'com.jsm.restate';
const platformId = Platform.OS === 'ios' ? iosBundleId : androidPackage;

export const client = new Client()
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(platformId);

console.log("Appwrite platform set to:", platformId);


export const account = new Account(client);
export const avatar = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const facilityFilterMap: Record<string, string> = {
  parking: 'Car Parking',
  'car parking': 'Car Parking',
  'sports center': 'Sports Center',
  'sports-center': 'Sports Center',
  gym: 'Gym',
  wifi: 'Wifi',
  'pet-friendly': 'Pet Center',
  'pet friendly': 'Pet Center',
  'pet center': 'Pet Center',
  laundry: 'Laundry',
  cutlery: 'Cutlery',
  'swimming pool': 'Swimming pool',
  'swimming_pool': 'Swimming pool',
};

const normaliseFacilityFilter = (value?: string | null) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const alias = facilityFilterMap[trimmed.toLowerCase()];
  return alias || trimmed;
};

const normaliseGeolocationPayload = (value: any): string | undefined => {
  if (!value) return undefined;

  const serialise = (lat: number, lng: number) =>
    JSON.stringify({
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    });

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    // Try to parse in case it's already JSON and ensure it serialises consistently
    try {
      const parsed = JSON.parse(trimmed);
      const lat = parseFloat(parsed.lat ?? parsed.latitude);
      const lng = parseFloat(parsed.lng ?? parsed.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return serialise(lat, lng);
      }
    } catch (err) {
      if (trimmed.includes(',')) {
        const [latPart, lngPart] = trimmed.split(',');
        const lat = parseFloat(latPart);
        const lng = parseFloat(lngPart);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return serialise(lat, lng);
        }
      }
    }

    return trimmed;
  }

  if (Array.isArray(value) && value.length >= 2) {
    const lat = parseFloat(value[0]);
    const lng = parseFloat(value[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return serialise(lat, lng);
    }
    return undefined;
  }

  if (typeof value === 'object') {
    const lat = parseFloat(value.lat ?? value.latitude);
    const lng = parseFloat(value.lng ?? value.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return serialise(lat, lng);
    }
  }

  return undefined;
};

export async function login() {
  try {
    // If already logged in, return early instead of trying to create a new session
    try {
      const existing = await account.get();
      if (existing && existing.$id) {
        console.log('login: session already active for user', existing.$id);
        return true;
      }
    } catch (e) {
      // If get() fails, continue to create a session
    }

    const redirectUri = Linking.createURL("oauth");

    const response = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: redirectUri,
      failure: redirectUri,
    });
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    let secret = url.searchParams.get("secret")?.toString();
    let userId = url.searchParams.get("userId")?.toString();
    // Fallback: sometimes params are in hash fragment
    if (!secret || !userId) {
      const hash = url.hash?.startsWith('#') ? url.hash.substring(1) : url.hash;
      if (hash) {
        const params = new URLSearchParams(hash);
        secret = secret || params.get('secret') || undefined as any;
        userId = userId || params.get('userId') || undefined as any;
      }
    }
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    // If Appwrite complains that a session exists, treat as non-fatal and return true
    try {
      const msg = (error as any)?.message || '';
      if (msg.toLowerCase().includes('prohibited') || msg.toLowerCase().includes('session is active')) {
        console.warn('login: session creation prohibited because a session is already active');
        return true;
      }
    } catch (e) {}

    console.error(error);
    return false;
  }
}

export async function logout() {
    try {
        const result = await account.deleteSession("current");
        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const result = await account.get();
        if (result.$id) {
            // Get user preferences for custom fields
            const prefs = result.prefs || {};
            
            // Convert avatar to proper URL string
            let userAvatar: string;
            if (prefs.photoURL) {
                userAvatar = prefs.photoURL;
            } else {
                // Generate initials avatar URL
                userAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(result.name)}&size=200`;
            }

            // Ensure agent entry exists in agents collection (but don't block on this)
            // Run in background without awaiting to avoid slowing down user fetching
            ensureAgentExists(result.$id, result.name, result.email, userAvatar, prefs.phone).catch(err => {
                console.log('Background agent sync failed (non-critical):', err);
            });

            return {
                ...result,
                avatar: userAvatar,
                phone: prefs.phone || "",
                bio: prefs.bio || "",
                photoURL: prefs.photoURL || "",
            };
        }

        return null;
    } catch (error) {
        // Silently handle guest/unauthenticated state - user will be redirected to sign-in
        const errorMsg = (error as any)?.message || '';
        if (!errorMsg.includes('missing scope') && !errorMsg.includes('guests')) {
            console.log(error);
        }
        return null;
    }
}
export async function getLatesProperties() {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            [Query.orderDesc("$createdAt"), Query.limit(5)]
        );
        return result.documents as unknown as PropertyDocument[];;
    } catch (error) {
        console.log(error);
        return [];
    }
}
export async function getProperties({
  filter,
  query,
  limit,
  minPrice,
  maxPrice,
  minBeds,
  maxBeds,
  bathrooms,
  facilities,
  sort,
}: {
  filter: string;
  query: string;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  bathrooms?: number;
  facilities?: string[];
  sort?: 'newest' | 'price_high' | 'price_low' | 'rating';
}) {
  try {
    const buildQuery: any[] = [];

    // SORT
    if (sort) {
      switch (sort) {
        case 'price_high':
          buildQuery.push(Query.orderDesc('price'));
          break;
        case 'price_low':
          buildQuery.push(Query.orderAsc('price'));
          break;
        case 'rating':
          buildQuery.push(Query.orderDesc('rating'));
          break;
        case 'newest':
        default:
          buildQuery.push(Query.orderDesc('$createdAt'));
      }
    } else {
      buildQuery.push(Query.orderDesc('$createdAt'));
    }

    // CATEGORY FILTER
    if (filter && filter !== 'all' && filter !== 'All') {
      buildQuery.push(Query.equal('type', filter));
    }

    // SEARCH (OR conditions)
    if (query) {
      buildQuery.push(
        Query.or([
          Query.search('name', query),
          Query.search('address', query),
          Query.search('type', query),
        ])
      );
    }

    // PRICE RANGE
    if (typeof minPrice === 'number') buildQuery.push(Query.greaterThanEqual('price', minPrice));
    if (typeof maxPrice === 'number') buildQuery.push(Query.lessThanEqual('price', maxPrice));

    // BEDS / BATHS
    if (typeof minBeds === 'number') buildQuery.push(Query.greaterThanEqual('bedrooms', minBeds));
    if (typeof maxBeds === 'number') buildQuery.push(Query.lessThanEqual('bedrooms', maxBeds));
    if (typeof bathrooms === 'number') buildQuery.push(Query.equal('bathrooms', bathrooms));

    // FACILITIES stored as ARRAY in schema; use contains for matching
    if (facilities && facilities.length > 0) {
      const normalisedFacilities = facilities
        .map((f: string) => normaliseFacilityFilter(typeof f === 'string' ? f : ''))
        .filter((f): f is string => !!f);

      if (normalisedFacilities.length > 0) {
        buildQuery.push(Query.contains('facilities', normalisedFacilities as any));
      }
    }

    if (limit) {
      buildQuery.push(Query.limit(limit));
    }

    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      buildQuery
    );

    return result.documents as unknown as PropertyDocument[];
  } catch (error) {
    console.log(error);
    return [];
  }
}

// Property Management Helpers (create/update/delete)
export async function createProperty(data: any) {
  try {
    // Attach current user as agent if not provided
    try {
      const user = await getCurrentUser();
      if (user && !data.agent) {
        // For Appwrite relationship many-to-one, store agent id
        data.agent = user.$id;
        console.log('Creating property with agent ID:', user.$id);
      }
    } catch (e) {
      // ignore - create without agent
      console.error('Could not get user for agent field:', e);
    }

    // Ensure required fields for the properties collection are present
    // Some Appwrite collection schemas may require a `rating` attribute.
    if (typeof data.rating !== 'number') {
      data.rating = 0;
    }

    const geolocationValue = normaliseGeolocationPayload(data.geolocation);
    if (geolocationValue) {
      data.geolocation = geolocationValue;
    } else {
      delete data.geolocation;
    }

    // Facilities: if configured as relationship, skip it during creation
    // If you want facilities as a simple array, change the attribute type in Appwrite
    if ('facilities' in data) {
      delete data.facilities;
      console.log('createProperty - skipping facilities (relationship field)');
    }

    // Remove reviews and gallery if they exist (these attributes/collections may have been deleted)
    if ('reviews' in data) {
      delete data.reviews;
    }
    if ('gallery' in data) {
      delete data.gallery;
    }

    const doc = await databases.createDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      ID.unique(),
      data
    );
    return { success: true, doc };
  } catch (error) {
    console.error('Error creating property:', error);
    return { success: false, error };
  }
}

export async function updateProperty(id: string, data: any) {
  try {
    console.log('updateProperty - incoming data keys:', Object.keys(data));
    
    // Create a minimal payload with ONLY the fields we want to update
    const updatePayload: any = {};
    
    // Only update non-relationship fields that are explicitly provided
    const allowedFields = ['name', 'address', 'price', 'bedrooms', 'bathrooms', 'area', 'type', 'description', 'images', 'rating'];
    
    for (const key of allowedFields) {
      if (key in data && data[key] !== undefined) {
        updatePayload[key] = data[key];
      }
    }

    // Handle geolocation separately
    if ('geolocation' in data) {
      const geolocationValue = normaliseGeolocationPayload(data.geolocation);
      if (geolocationValue) {
        updatePayload.geolocation = geolocationValue;
      }
    }

    // Ensure numeric fields are numbers
    if ('price' in updatePayload) updatePayload.price = Number(updatePayload.price);
    if ('bedrooms' in updatePayload) updatePayload.bedrooms = Number(updatePayload.bedrooms);
    if ('bathrooms' in updatePayload) updatePayload.bathrooms = Number(updatePayload.bathrooms);
    if ('area' in updatePayload) updatePayload.area = Number(updatePayload.area);
    if ('rating' in updatePayload) updatePayload.rating = Number(updatePayload.rating);

    console.log('updateProperty - final payload:', JSON.stringify(updatePayload, null, 2));

    const doc = await databases.updateDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id,
      updatePayload
    );
    return { success: true, doc };
  } catch (error) {
    console.error('Error updating property:', error);
    return { success: false, error };
  }
}

export async function deleteProperty(id: string) {
  try {
    await databases.deleteDocument(
      config.databaseId!,
      config.propertiesCollectionId!,
      id
    );
    return { success: true };
  } catch (error) {
    console.error('Error deleting property:', error);
    return { success: false, error };
  }
}

// Upload multiple gallery images to a bucket and (optionally) create gallery documents
export async function uploadGalleryImages(images: string[], bucketId: string) {
  try {
    const uploaded: any[] = [];
    for (const uri of images) {
      const filename = uri.split('/').pop() || `gallery-${Date.now()}.jpg`;
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileObject = {
        name: filename,
        type: blob.type || 'image/jpeg',
        size: blob.size,
        uri,
        slice: blob.slice?.bind(blob),
        stream: blob.stream?.bind(blob),
        arrayBuffer: blob.arrayBuffer?.bind(blob),
      } as any;

      const uploadBucket = bucketId || config.profileImagesBucketId!;
      const uploadedFile = await storage.createFile(uploadBucket, ID.unique(), fileObject as any);
      const fileUrl = `${config.endpoint}/storage/buckets/${uploadBucket}/files/${uploadedFile.$id}/view?project=${config.projectId}`;

      // Also create a gallery document (if galleries collection configured)
      let galleryDoc: any = null;
      try {
        if (config.galleriesCollectionId) {
          galleryDoc = await databases.createDocument(
            config.databaseId!,
            config.galleriesCollectionId!,
            ID.unique(),
            { image: fileUrl }
          );
        }
      } catch (e) {
        console.warn('Could not create gallery document:', e);
      }

      uploaded.push({ fileId: uploadedFile.$id, fileUrl, galleryDoc });
    }
    return { success: true, uploaded };
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    return { success: false, error };
  }
}
export async function getPropertyById({ id }: { id: string }){
   try {
    const result = await databases.getDocument(
        config.databaseId!,
        config.propertiesCollectionId!,
        id
    );
    return result;
   } catch (error) {
    console.log(error);
    return null;
   }
}

export async function getMyProperties(params?: any) {
  try {
    // Support being called with either a userId string or a params object { userId }
    let uid: string | undefined;
    if (typeof params === 'string') {
      uid = params;
    } else if (params && typeof params === 'object') {
      uid = params.userId || params.userId?.toString();
    }

    if (!uid) {
      const user = await getCurrentUser();
      uid = user?.$id;
    }

    if (!uid) {
      console.log('getMyProperties: No user ID found');
      return [];
    }

    console.log('getMyProperties: Querying properties for agent ID:', uid);
    const result = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.equal('agent', uid as any), Query.orderDesc('$createdAt')]
    );

    console.log('getMyProperties: Found', result.documents.length, 'properties');
    return result.documents as unknown as PropertyDocument[];
  } catch (error) {
    console.error('Error fetching user properties:', error);
    return [];
  }
}

// Profile Update Functions

export async function updateUserName(name: string) {
  try {
    await account.updateName(name);
    return { success: true };
  } catch (error) {
    console.error("Error updating name:", error);
    return { success: false, error };
  }
}

export async function updateUserPreferences(prefs: { phone?: string; bio?: string; photoURL?: string }) {
  try {
    const currentUser = await account.get();
    const currentPrefs = currentUser.prefs || {};
    
    // Merge with existing preferences
    const updatedPrefs = {
      ...currentPrefs,
      ...prefs,
    };
    
    await account.updatePrefs(updatedPrefs);
    
    // Also create/update agent entry in agents collection
    await ensureAgentExists(
      currentUser.$id, 
      currentUser.name, 
      currentUser.email, 
      prefs.photoURL || currentPrefs.photoURL,
      prefs.phone || currentPrefs.phone
    );
    
    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error };
  }
}

// Create or update agent entry in agents collection
export async function ensureAgentExists(userId: string, name: string, email: string, avatarValue?: string, phone?: string) {
  try {
    // Convert avatar to string URL if it's not already
    let avatarUrl: string;
    
    if (avatarValue && typeof avatarValue === 'string') {
      // Check if it's already a valid URL
      if (avatarValue.startsWith('http://') || avatarValue.startsWith('https://')) {
        avatarUrl = avatarValue;
      } else {
        // If it's not a URL, generate one
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200`;
      }
    } else {
      // Default avatar URL
      avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200`;
    }
    
    // Check if agent already exists
    const existingAgents = await databases.listDocuments(
      config.databaseId!,
      config.agentsCollectionId!,
      [Query.equal('$id', userId)]
    );

    const agentData: any = {
      name: name,
      email: email,
      avatar: avatarUrl
    };
    
    // Add phone if provided
    if (phone) {
      agentData.phone = phone;
    }

    if (existingAgents.documents.length > 0) {
      // Update existing agent
      await databases.updateDocument(
        config.databaseId!,
        config.agentsCollectionId!,
        userId,
        agentData
      );
      console.log('Agent updated successfully');
    } else {
      // Create new agent with the user's ID
      await databases.createDocument(
        config.databaseId!,
        config.agentsCollectionId!,
        userId, // Use user ID as agent ID for easy relationship
        agentData
      );
      console.log('Agent created successfully');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error ensuring agent exists:", error);
    return { success: false, error };
  }
}

export async function uploadProfileImage(imageUri: string) {
  try {
    console.log("Starting upload...");
    console.log("Bucket ID:", config.profileImagesBucketId);
    console.log("Image URI:", imageUri);
    
    const filename = imageUri.split('/').pop() || `profile-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    // Fetch the file as a blob
    console.log("Fetching file from URI...");
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    console.log("Blob size:", blob.size);
    console.log("Blob type:", blob.type);
    
    // Create a custom object that mimics a File for React Native Appwrite
    const fileObject = {
      name: filename,
      type: type,
      size: blob.size,
      uri: imageUri,
      // Add blob data methods
      slice: blob.slice.bind(blob),
      stream: blob.stream?.bind(blob),
      text: blob.text?.bind(blob),
      arrayBuffer: blob.arrayBuffer?.bind(blob),
    };
    
    console.log("File object created:", fileObject.name, fileObject.size, fileObject.type);
    console.log("Uploading to Appwrite...");

    const uploadedFile = await storage.createFile(
      config.profileImagesBucketId!,
      ID.unique(),
      fileObject as any
    );

    console.log("Upload result:", uploadedFile);

    if (!uploadedFile || !uploadedFile.$id) {
      throw new Error("File upload returned undefined or missing $id");
    }

    const fileUrl = `${config.endpoint}/storage/buckets/${config.profileImagesBucketId}/files/${uploadedFile.$id}/view?project=${config.projectId}`;
    
    console.log("Upload successful! File URL:", fileUrl);

    return { success: true, fileUrl, fileId: uploadedFile.$id };
  } catch (error: any) {
    console.error("Error uploading profile image:", error);
    console.error("Error message:", error?.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    return { success: false, error };
  }
}


export async function deleteProfileImage(fileId: string) {
  try {
    await storage.deleteFile(config.profileImagesBucketId!, fileId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting profile image:", error);
    return { success: false, error };
  }
}

// Favorites Functions

export async function addFavorite(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const favorite = await databases.createDocument(
      config.databaseId!,
      config.favoritesCollectionId!,
      ID.unique(),
      {
        userId: user.$id,
        propertyId: propertyId,
        favoriteDate: new Date().toISOString(),
        notes: "",
        isShared: false,
        sharedWith: [],
      }
    );

    return { success: true, favorite };
  } catch (error: any) {
    // If error is duplicate (409), it's already favorited
    if (error?.code === 409) {
      return { success: true, message: "Already in favorites" };
    }
    console.error("Error adding favorite:", error);
    return { success: false, error };
  }
}

export async function removeFavorite(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Find the favorite document
    const favorites = await databases.listDocuments(
      config.databaseId!,
      config.favoritesCollectionId!,
      [
        Query.equal("userId", user.$id),
        Query.equal("propertyId", propertyId),
      ]
    );

    if (favorites.documents.length === 0) {
      return { success: true, message: "Not in favorites" };
    }

    // Delete the favorite
    await databases.deleteDocument(
      config.databaseId!,
      config.favoritesCollectionId!,
      favorites.documents[0].$id
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing favorite:", error);
    return { success: false, error };
  }
}

export async function getFavorites() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const favorites = await databases.listDocuments(
      config.databaseId!,
      config.favoritesCollectionId!,
      [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
    );

    // Get full property details for each favorite
    const propertyIds = favorites.documents.map((fav: any) => fav.propertyId);
    
    if (propertyIds.length === 0) {
      return [];
    }

    // Fetch all favorite properties
    const properties = await databases.listDocuments(
      config.databaseId!,
      config.propertiesCollectionId!,
      [Query.equal("$id", propertyIds)]
    );

    return properties.documents as unknown as PropertyDocument[];
  } catch (error) {
    console.error("Error getting favorites:", error);
    return [];
  }
}

export async function getFavoriteIds() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return [];
    }

    const favorites = await databases.listDocuments(
      config.databaseId!,
      config.favoritesCollectionId!,
      [Query.equal("userId", user.$id)]
    );

    return favorites.documents.map((fav: any) => fav.propertyId);
  } catch (error) {
    console.error("Error getting favorite IDs:", error);
    return [];
  }
}

export async function isFavorite(propertyId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const favorites = await databases.listDocuments(
      config.databaseId!,
      config.favoritesCollectionId!,
      [
        Query.equal("userId", user.$id),
        Query.equal("propertyId", propertyId),
        Query.limit(1),
      ]
    );

    return favorites.documents.length > 0;
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
}