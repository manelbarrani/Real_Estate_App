import { checkAvailability } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface BookingCalendarProps {
  propertyId: string;
  pricePerNight: number;
  onDatesSelected: (
    checkIn: string,
    checkOut: string,
    nights: number,
    total: number
  ) => void;
}

interface MarkedDates {
  [date: string]: {
    selected?: boolean;
    marked?: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    disabled?: boolean;
    disableTouchEvent?: boolean;
  };
}

export default function BookingCalendar({
  propertyId,
  pricePerNight,
  onDatesSelected,
}: BookingCalendarProps) {
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch unavailable dates for this property
  useEffect(() => {
    // For now, we don't pre-fetch unavailable dates
    // They will be checked when user selects a range
    // You can implement getPropertyBookings here if you want to show unavailable dates
  }, [propertyId]);

  const fetchUnavailableDates = async () => {
    // This function is not used anymore since checkAvailability returns boolean
    // You could implement getPropertyBookings to fetch all bookings and mark them
  };

  const updateMarkedDates = (
    checkIn: string | null,
    checkOut: string | null,
    unavailable: string[] = unavailableDates
  ) => {
    const marked: MarkedDates = {};

    // Mark unavailable dates
    unavailable.forEach((date) => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        color: "#FFE5E5",
        textColor: "#999",
      };
    });

    // Mark selected range
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        
        if (current.getTime() === start.getTime()) {
          marked[dateStr] = {
            startingDay: true,
            color: "#191d31",
            textColor: "#fff",
          };
        } else if (current.getTime() === end.getTime()) {
          marked[dateStr] = {
            endingDay: true,
            color: "#191d31",
            textColor: "#fff",
          };
        } else {
          marked[dateStr] = {
            color: "#191d31",
            textColor: "#fff",
          };
        }
        
        current.setDate(current.getDate() + 1);
      }
    } else if (checkIn) {
      marked[checkIn] = {
        selected: true,
        color: "#191d31",
        textColor: "#fff",
      };
    }

    setMarkedDates(marked);
  };

  const onDayPress = async (day: DateData) => {
    const selectedDate = day.dateString;

    // Check if date is unavailable (from local state - not used currently)
    if (unavailableDates.includes(selectedDate)) {
      Alert.alert(
        "Date Unavailable",
        "This date is already booked. Please select another date."
      );
      return;
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    
    if (selected < today) {
      Alert.alert("Invalid Date", "Please select a future date.");
      return;
    }

    if (!checkInDate) {
      // First selection - check-in date
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      updateMarkedDates(selectedDate, null);
    } else if (!checkOutDate) {
      // Second selection - check-out date
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(selectedDate);

      if (checkOut <= checkIn) {
        Alert.alert(
          "Invalid Date",
          "Check-out date must be after check-in date."
        );
        return;
      }

      // Check availability with the backend
      setLoading(true);
      try {
        const isAvailable = await checkAvailability(
          propertyId,
          checkInDate,
          selectedDate
        );

        if (!isAvailable) {
          Alert.alert(
            "Dates Unavailable",
            "Some dates in this range are already booked. Please select different dates."
          );
          setCheckInDate(null);
          setCheckOutDate(null);
          updateMarkedDates(null, null);
          return;
        }

        setCheckOutDate(selectedDate);
        updateMarkedDates(checkInDate, selectedDate);

        // Calculate nights and total
        const nights = Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );
        const subtotal = nights * pricePerNight;
        const serviceFee = subtotal * 0.1; // 10% service fee
        const total = subtotal + serviceFee;

        onDatesSelected(checkInDate, selectedDate, nights, total);
      } catch (error) {
        console.error("Error checking availability:", error);
        Alert.alert("Error", "Failed to check availability. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Third selection - reset and start over
      setCheckInDate(selectedDate);
      setCheckOutDate(null);
      updateMarkedDates(selectedDate, null);
    }
  };

  const clearDates = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    updateMarkedDates(null, null);
    onDatesSelected("", "", 0, 0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View className="bg-white rounded-2xl p-5 mb-5">
      <Text className="text-xl font-rubik-bold text-black-300 mb-2">
        Select Dates
      </Text>
      <Text className="text-sm font-rubik text-black-200 mb-4">
        Choose your check-in and check-out dates
      </Text>

      {loading ? (
        <View className="py-10">
          <ActivityIndicator size="large" color="#191d31" />
        </View>
      ) : (
        <>
          <Calendar
            minDate={new Date().toISOString().split("T")[0]}
            maxDate={
              new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]
            }
            onDayPress={onDayPress}
            markingType="period"
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#191d31",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#191d31",
              arrowColor: "#191d31",
              monthTextColor: "#191d31",
              textMonthFontWeight: "bold",
              textDayFontSize: 14,
              textMonthFontSize: 16,
            }}
          />

          {checkInDate && (
            <View className="mt-5 p-4 bg-primary-100 rounded-xl">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-xs font-rubik text-black-200 mb-1">
                    Check-in
                  </Text>
                  <Text className="text-base font-rubik-semibold text-black-300">
                    {formatDate(checkInDate)}
                  </Text>
                </View>
                
                {checkOutDate && (
                  <View className="flex-1">
                    <Text className="text-xs font-rubik text-black-200 mb-1">
                      Check-out
                    </Text>
                    <Text className="text-base font-rubik-semibold text-black-300">
                      {formatDate(checkOutDate)}
                    </Text>
                  </View>
                )}
              </View>

              {checkOutDate && (
                <View className="mt-3 pt-3 border-t border-black-100">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-rubik text-black-200">
                      {Math.ceil(
                        (new Date(checkOutDate).getTime() -
                          new Date(checkInDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      nights × ${pricePerNight}
                    </Text>
                    <Text className="text-sm font-rubik text-black-300">
                      $
                      {(
                        Math.ceil(
                          (new Date(checkOutDate).getTime() -
                            new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) * pricePerNight
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm font-rubik text-black-200">
                      Service fee (10%)
                    </Text>
                    <Text className="text-sm font-rubik text-black-300">
                      $
                      {(
                        Math.ceil(
                          (new Date(checkOutDate).getTime() -
                            new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) *
                        pricePerNight *
                        0.1
                      ).toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-black-100">
                    <Text className="text-base font-rubik-bold text-black-300">
                      Total
                    </Text>
                    <Text className="text-base font-rubik-bold text-primary-300">
                      $
                      {(
                        Math.ceil(
                          (new Date(checkOutDate).getTime() -
                            new Date(checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) *
                        pricePerNight *
                        1.1
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={clearDates}
                className="mt-3 py-2 items-center"
              >
                <Text className="text-sm font-rubik-medium text-danger-300">
                  Clear Dates
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
