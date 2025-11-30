import { ID } from "react-native-appwrite";
import { config, databases } from "./appwrite";
import {
    agentImages,
    galleryImages,
    propertiesImages,
    reviewImages,
} from "./data";

const COLLECTIONS = {
  AGENT: config.agentsCollectionId,
  REVIEWS: config.reviewsCollectionId,
  GALLERY: config.galleriesCollectionId,
  PROPERTY: config.propertiesCollectionId,
};

const propertyTypes = [
  "House",
  "Townhome",
  "Condo",
  "Duplex",
  "Studio",
  "Villa",
  "Apartment",
  "Other",
];

const FACILITY_OPTIONS = [
  "Laundry",
  "Car Parking",
  "Sports Center",
  "Cutlery",
  "Gym",
  "Swimming pool",
  "Wifi",
  "Pet Center",
];

const facilityAliasMap: Record<string, string> = {
  parking: "Car Parking",
  "car parking": "Car Parking",
  "sports center": "Sports Center",
  "sports-center": "Sports Center",
  gym: "Gym",
  wifi: "Wifi",
  "pet-friendly": "Pet Center",
  "pet friendly": "Pet Center",
  "pet center": "Pet Center",
  laundry: "Laundry",
  cutlery: "Cutlery",
  "swimming pool": "Swimming pool",
  "swimming_pool": "Swimming pool",
};

const getRandomFacilitySubset = () => getRandomSubset(FACILITY_OPTIONS, 2, 4);

const normaliseFacilityName = (value: unknown) => {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  const byAlias = facilityAliasMap[trimmed.toLowerCase()];
  if (byAlias) return byAlias;
  if (FACILITY_OPTIONS.includes(trimmed)) return trimmed;
  return null;
};

// Helper function to add delay between operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const serialiseGeolocation = (lat: number, lng: number) =>
  JSON.stringify({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });

const parseGeolocationString = (value: string): { lat: number | null; lng: number | null } => {
  try {
    const parsed = JSON.parse(value);
    const lat = parseFloat(parsed.lat ?? parsed.latitude);
    const lng = parseFloat(parsed.lng ?? parsed.longitude);
    return {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
    };
  } catch (err) {
    if (value.includes(",")) {
      const [latPart, lngPart] = value.split(",");
      const lat = parseFloat(latPart);
      const lng = parseFloat(lngPart);
      return {
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
      };
    }
  }

  return { lat: null, lng: null };
};

function getRandomSubset<T>(
  array: T[],
  minItems: number,
  maxItems: number
): T[] {
  if (minItems > maxItems) {
    throw new Error("minItems cannot be greater than maxItems");
  }
  if (minItems < 0 || maxItems > array.length) {
    throw new Error(
      "minItems or maxItems are out of valid range for the array"
    );
  }

  // Generate a random size for the subset within the range [minItems, maxItems]
  const subsetSize =
    Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

  // Create a copy of the array to avoid modifying the original
  const arrayCopy = [...array];

  // Shuffle the array copy using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[i],
    ];
  }

  // Return the first `subsetSize` elements of the shuffled array
  return arrayCopy.slice(0, subsetSize);
}

async function seed() {
  try {
    // Check if data already exists
    const propertiesCheck = await databases.listDocuments(
      config.databaseId!,
      COLLECTIONS.PROPERTY!
    );
    
    if (propertiesCheck.total > 0) {
      console.log(`Database already has ${propertiesCheck.total} properties. Running backfill for missing fields...`);

      let updatedCount = 0;
      for (const existing of propertiesCheck.documents) {
        const updates: Record<string, any> = {};
        let needsUpdate = false;

        // Ensure geolocation exists and is numeric
        const geo = existing.geolocation;
        let lat: number | null = null;
        let lng: number | null = null;

        if (geo) {
          if (typeof geo === 'string') {
            const parsed = parseGeolocationString(geo);
            lat = parsed.lat;
            lng = parsed.lng;
          }

          if (typeof geo.lat === 'number') lat = geo.lat;
          if (typeof geo.lng === 'number') lng = geo.lng;

          if (lat === null && typeof geo.lat === 'string') {
            const parsed = parseFloat(geo.lat);
            if (!Number.isNaN(parsed)) lat = parsed;
          }
          if (lng === null && typeof geo.lng === 'string') {
            const parsed = parseFloat(geo.lng);
            if (!Number.isNaN(parsed)) lng = parsed;
          }

          if (lat === null && typeof geo.latitude === 'string') {
            const parsed = parseFloat(geo.latitude);
            if (!Number.isNaN(parsed)) lat = parsed;
          }
          if (lng === null && typeof geo.longitude === 'string') {
            const parsed = parseFloat(geo.longitude);
            if (!Number.isNaN(parsed)) lng = parsed;
          }
        }

        if (lat === null || !Number.isFinite(lat)) {
          lat = 33.5 + Math.random() * 1.0;
        }
        if (lng === null || !Number.isFinite(lng)) {
          lng = 9.0 + Math.random() * 1.0;
        }

        const geolocationValue = serialiseGeolocation(lat, lng);

        if (typeof existing.geolocation !== 'string' || existing.geolocation !== geolocationValue) {
          updates.geolocation = geolocationValue;
          needsUpdate = true;
        }

        if (typeof existing.rating !== 'number') {
          updates.rating = 0;
          needsUpdate = true;
        }

        if (Array.isArray(existing.facilities)) {
          const normalisedFacilities = existing.facilities
            .map(normaliseFacilityName)
            .filter((f): f is string => !!f);

          if (normalisedFacilities.length === 0) {
            normalisedFacilities.push(...getRandomFacilitySubset());
          }

          // Update only if different
          const same =
            normalisedFacilities.length === existing.facilities.length &&
            normalisedFacilities.every((v, i) => v === existing.facilities[i]);

          if (!same) {
            updates.facilities = normalisedFacilities;
            needsUpdate = true;
          }
        } else {
          // If facilities is missing or not an array, set an array of facilities
          updates.facilities = getRandomFacilitySubset();
          needsUpdate = true;
        }

        if (needsUpdate) {
          await databases.updateDocument(
            config.databaseId!,
            COLLECTIONS.PROPERTY!,
            existing.$id,
            updates
          );
          updatedCount += 1;
          await delay(80);
        }
      }

      console.log(`Backfill completed. Updated ${updatedCount} properties.`);
      if (typeof alert === 'function') {
        alert(updatedCount > 0
          ? 'Database already seeded. Missing geolocation, rating, and facilities were updated.'
          : 'Database already seeded and up-to-date.');
      }
      return;
    }

    console.log("Starting seed process...");

    // Seed Agents
    const agents = [];
    for (let i = 1; i <= 5; i++) {
      const agent = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.AGENT!,
        ID.unique(),
        {
          name: `Agent ${i}`,
          email: `agent${i}@example.com`,
          avatar: agentImages[Math.floor(Math.random() * agentImages.length)],
        }
      );
      agents.push(agent);
      await delay(100); // Small delay between requests
    }
    console.log(`Seeded ${agents.length} agents.`);

    // Seed Reviews
    const reviews = [];
    for (let i = 1; i <= 20; i++) {
      const review = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.REVIEWS!,
        ID.unique(),
        {
          name: `Reviewer ${i}`,
          avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
          review: `This is a review by Reviewer ${i}.`,
          rating: Math.floor(Math.random() * 5) + 1, // Rating between 1 and 5
        }
      );
      reviews.push(review);
      await delay(100); // Small delay between requests
    }
    console.log(`Seeded ${reviews.length} reviews.`);

    // Seed Galleries
    const galleries = [];
    for (const image of galleryImages) {
      const gallery = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.GALLERY!,
        ID.unique(),
        { image }
      );
      galleries.push(gallery);
      await delay(50); // Small delay between requests
    }

    console.log(`Seeded ${galleries.length} galleries.`);

    // Seed Properties
    for (let i = 1; i <= 20; i++) {
      const assignedAgent = agents[Math.floor(Math.random() * agents.length)];

      const assignedReviews = getRandomSubset(reviews, 5, 7); // 5 to 7 reviews
      const assignedGalleries = getRandomSubset(galleries, 3, 8); // 3 to 8 galleries

          const selectedFacilities = getRandomFacilitySubset();

      const image =
        propertiesImages.length - 1 >= i
          ? propertiesImages[i]
          : propertiesImages[
              Math.floor(Math.random() * propertiesImages.length)
            ];

      // Generate reasonable lat/lng values (around Tunis area) for map markers
      const lat = 33.5 + Math.random() * 1.0; // 33.5 - 34.5
      const lng = 9.0 + Math.random() * 1.0; // 9.0 - 10.0

      const property = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.PROPERTY!,
        ID.unique(),
        {
          name: `Property ${i}`,
          type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
          description: `This is the description for Property ${i}.`,
          address: `123 Property Street, City ${i}`,
          geolocation: serialiseGeolocation(lat, lng),
          price: Math.floor(Math.random() * 9000) + 1000,
          area: Math.floor(Math.random() * 3000) + 500,
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 5) + 1,
          rating: Math.floor(Math.random() * 5) + 1,
          facilities: selectedFacilities,
          image: image,
          agent: assignedAgent.$id,
          reviews: assignedReviews.map((review) => review.$id),
          gallery: assignedGalleries.map((gallery) => gallery.$id),
        }
      );

      console.log(`Seeded property: ${property.name}`);
      await delay(150); // Small delay between requests
    }

    console.log("Data seeding completed successfully!");
    alert('Database seeded successfully!');
  } catch (error) {
    console.error("Error seeding data:", error);
    alert('Error seeding data. Check console for details.');
  }
}

export default seed;