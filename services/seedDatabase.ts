import { fakeRestaurants } from "../data/data";
import {
  createDatabaseEntry,
  checkIfCollectionHasDocuments,
  deleteAllDocuments
 } from "./databaseActions";

export const seedDatabase = async () => {
  const collectionName = "restaurants";

  console.log("🚀 Starting database seeding...");
  try {
    // ✅ Check if collection has documents
    const hasDocuments = await checkIfCollectionHasDocuments(collectionName);
    if (hasDocuments) {
      // ✅ Delete all documents in the collection
      await deleteAllDocuments(collectionName);
      console.log(`Deleted all documents in '${collectionName}'.`);
    }

    for (const restaurant of fakeRestaurants) {
      await createDatabaseEntry(restaurant, "restaurants"); // ✅ Ensure proper async handling
      console.log(`Seeded: ${restaurant.name}`); // ✅ Log each success
    }
    console.log("Database seeding completed successfully! 🎉"); // ✅ Confirmation message
  } catch (error) {
    console.error("Error seeding database:", error); // ✅ Proper error handling
  }
};
