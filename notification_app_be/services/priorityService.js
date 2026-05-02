import axios from "axios";
const priorityMap = {
  Placement: 3,
  Event: 2,
  Result: 1,
};

export const getTopNotifications = (notifications, limit = 10) => {
  return notifications
    .map(n => ({
      ...n,
      priority: priorityMap[n.Type] || 0,
    }))
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.Timestamp) - new Date(a.Timestamp);
    })
    .slice(0, limit);
};