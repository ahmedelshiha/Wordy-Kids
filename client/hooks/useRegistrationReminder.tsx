import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

interface UseRegistrationReminderOptions {
  delayMinutes?: number;
  reminderIntervalMinutes?: number;
  maxReminders?: number;
}

export const useRegistrationReminder = ({
  delayMinutes = 5, // Show first reminder after 5 minutes
  reminderIntervalMinutes = 10, // Show reminder every 10 minutes
  maxReminders = 3, // Maximum of 3 reminders per session
}: UseRegistrationReminderOptions = {}) => {
  const { isGuest } = useAuth();
  const [showFloatingReminder, setShowFloatingReminder] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    // Don't show reminders for registered users
    if (!isGuest) {
      return;
    }

    // Check if user has permanently dismissed reminders
    const permanentDismissal = localStorage.getItem(
      "registrationReminderDismissed",
    );
    if (permanentDismissal === "true") {
      return;
    }

    // Check session dismissal count
    const sessionDismissals = parseInt(
      sessionStorage.getItem("registrationReminderCount") || "0",
    );

    if (sessionDismissals >= maxReminders) {
      return;
    }

    // Set up the initial delay
    const initialTimeout = setTimeout(
      () => {
        setShowFloatingReminder(true);
      },
      delayMinutes * 60 * 1000,
    );

    return () => {
      clearTimeout(initialTimeout);
    };
  }, [isGuest, delayMinutes, maxReminders]);

  // Set up recurring reminders
  useEffect(() => {
    if (!isGuest || reminderCount >= maxReminders) {
      return;
    }

    if (showFloatingReminder && reminderCount < maxReminders) {
      const recurringTimeout = setTimeout(
        () => {
          setShowFloatingReminder(true);
          setReminderCount((prev) => prev + 1);
        },
        reminderIntervalMinutes * 60 * 1000,
      );

      return () => {
        clearTimeout(recurringTimeout);
      };
    }
  }, [
    isGuest,
    showFloatingReminder,
    reminderCount,
    reminderIntervalMinutes,
    maxReminders,
  ]);

  const dismissFloatingReminder = (permanent: boolean = false) => {
    setShowFloatingReminder(false);

    // Update session count
    const currentCount = parseInt(
      sessionStorage.getItem("registrationReminderCount") || "0",
    );
    sessionStorage.setItem(
      "registrationReminderCount",
      (currentCount + 1).toString(),
    );

    if (permanent) {
      localStorage.setItem("registrationReminderDismissed", "true");
    }
  };

  const resetReminders = () => {
    localStorage.removeItem("registrationReminderDismissed");
    sessionStorage.removeItem("registrationReminderCount");
    setReminderCount(0);
    setShowFloatingReminder(false);
  };

  return {
    showFloatingReminder: showFloatingReminder && isGuest,
    dismissFloatingReminder,
    resetReminders,
    reminderCount,
    maxRemindersReached: reminderCount >= maxReminders,
  };
};

export default useRegistrationReminder;
