import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  addReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../../../services/databaseActions";
import { useRestaurant } from "../../../contexts/RestaurantContext";
import { useUser } from "../../../contexts/userContext";

// Define TypeScript types for reviews
interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  userId: string;
  restaurantId: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { restaurantId } = useRestaurant();
  const { user } = useUser();
  const userId = user?.uid || "";

  // Initialize newReview with correct typing
  const [newReview, setNewReview] = useState<Omit<Review, "id">>({
    title: "",
    body: "",
    rating: 0,
    userId: userId,
    restaurantId: restaurantId || "",
  });

  useEffect(() => {
    if (!restaurantId) return;
    getReviews(restaurantId)
      .then((reviewsData: Review[]) => setReviews(reviewsData))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleAddReview = async () => {
    if (!newReview.title || !newReview.body || newReview.rating <= 0) {
      alert("Please fill in all fields and provide a valid rating.");
      return;
    }

    try {
      const reviewData = { ...newReview, userId };
      const newReviewId = await addReview(restaurantId, reviewData); // Assume addReview returns the ID
      setReviews([...reviews, { ...reviewData, id: newReviewId }]); // Include ID
      setNewReview({ title: "", body: "", rating: 0, userId, restaurantId });
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    const updatedData: Partial<Review> = {
      title: "Updated title",
      body: "Updated body",
      rating: 5,
    };

    try {
      await updateReview(reviewId, updatedData);
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, ...updatedData } : review
        )
      );
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reviews</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewTitle}>{item.title}</Text>
              <Text style={styles.reviewText}>{item.body}</Text>
              <Text style={styles.reviewRating}>Rating: {item.rating}</Text>

              {userId === item.userId && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReview(item.id)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={() => handleUpdateReview(item.id)}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      ) : (
        <Text>No reviews yet</Text>
      )}

      {/* Add Review Form */}
      <Text style={styles.subTitle}>Add Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={newReview.title}
        onChangeText={(text) => setNewReview({ ...newReview, title: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Body"
        value={newReview.body}
        onChangeText={(text) => setNewReview({ ...newReview, body: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        keyboardType="numeric"
        value={newReview.rating.toString()}
        onChangeText={(text) => {
          const ratingValue = parseInt(text) || 0;
          if (ratingValue >= 1 && ratingValue <= 5) {
            setNewReview({ ...newReview, rating: ratingValue });
          }
        }}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddReview}>
        <Text style={styles.buttonText}>Add Review</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  reviewItem: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
  },
  reviewRating: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: "blue",
    padding: 8,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
});
