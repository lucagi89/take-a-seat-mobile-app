import { fakeRestaurants } from "../data/data";
import { createDatabaseEntry } from "./databaseActions";

const seedDatabase = async () => {
  console.log("🚀 Starting database seeding...");
  try {
    for (const restaurant of fakeRestaurants) {
      await createDatabaseEntry(restaurant, "restaurants"); // ✅ Ensure proper async handling
      console.log(`Seeded: ${restaurant.name}`); // ✅ Log each success
    }
    console.log("Database seeding completed successfully! 🎉"); // ✅ Confirmation message
  } catch (error) {
    console.error("Error seeding database:", error); // ✅ Proper error handling
  }
};

seedDatabase();
