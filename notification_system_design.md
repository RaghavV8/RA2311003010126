```markdown
# Notification System Design

## Stage 1: API Design

### Core Actions
The notification system needs to support the following key functionalities:
- Fetching notifications for users
- Marking notifications as read
- Sending new notifications
- Providing real-time updates to connected clients

### API Endpoints

#### 1. Get Notifications
Retrieve all notifications for a specific user.

```http
GET /notifications?userId=123
```

**Response:**
```json
[
  {
    "id": "n1",
    "type": "placement",
    "message": "You are shortlisted",
    "isRead": false,
    "createdAt": "2026-05-01T10:00:00Z"
  }
]
```

#### 2. Mark Notification as Read
Update the read status of a notification.

```http
POST /notifications/read
```

**Request Body:**
```json
{
  "notificationId": "n1"
}
```

#### 3. Send Notification
Create and send notifications to multiple users.

```http
POST /notifications/send
```

**Request Body:**
```json
{
  "userIds": [1, 2, 3],
  "message": "New placement opportunity",
  "type": "placement"
}
```

### Real-Time Mechanism
To deliver notifications instantly, we use WebSockets or Socket.IO. This allows the server to push updates to connected clients in real-time without requiring constant polling from the client side.

---

## Stage 2: Database Design

### Recommended Database
**PostgreSQL** (Relational Database)

### Why PostgreSQL?
- Provides structured data storage with well-defined relationships
- Ensures strong consistency and ACID properties
- Supports complex queries and efficient indexing
- Mature ecosystem with excellent tooling

### Database Schema

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  type VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Scalability Challenges

As the system grows, we may encounter:
- Slow query performance with millions of records
- High read load causing database bottlenecks
- Storage limitations

### Solutions to Scale

1. **Indexing**: Create indexes on frequently queried columns
2. **Pagination**: Limit the number of results returned per request
3. **Partitioning**: Divide the table by userId or date ranges
4. **Archiving**: Move old notifications to separate storage

### Example Query with Pagination

```sql
SELECT * FROM notifications
WHERE userId = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 20;
```

---

## Stage 3: Query Optimization

### Original Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

### Identified Issues

1. **No index**: Results in a full table scan, which is inefficient
2. **Sorting overhead**: Sorting large datasets without an index is slow
3. **No limit**: Fetching all matching rows consumes unnecessary resources

### Optimization Strategy

#### Add a Composite Index

```sql
CREATE INDEX idx_user_read_time 
ON notifications (studentID, isRead, createdAt DESC);
```

This index covers all columns in the WHERE clause and ORDER BY, allowing the database to quickly locate and retrieve relevant rows.

#### Optimized Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC
LIMIT 20;
```

### Should We Index Every Column?

**No.** While indexes speed up reads, they come with trade-offs:
- Slower insert and update operations
- Increased storage requirements
- Maintenance overhead

Only index columns that are frequently used in WHERE, JOIN, or ORDER BY clauses.

### Additional Query Example

Find students who received placement notifications in the last 7 days:

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```

---

## Stage 4: Performance Improvements

### The Problem
Frequent read operations can overload the database, leading to slow response times and poor user experience.

### Solutions

#### 1. Caching with Redis
Store frequently accessed notifications in memory for faster retrieval. This reduces database load significantly.

#### 2. Pagination
Return a limited number of results per request, allowing users to load more as needed.

#### 3. Lazy Loading
Implement infinite scroll or "load more" functionality to fetch additional notifications on demand.

#### 4. Read Replicas
Distribute read traffic across multiple database replicas to balance the load.

### Trade-offs Analysis

| Solution | Advantages | Disadvantages |
|----------|-----------|---------------|
| **Caching** | Very fast reads, reduces DB load | Cache invalidation complexity, potential stale data |
| **Pagination** | Efficient data transfer, better UX | Requires multiple requests for complete data |
| **Read Replicas** | Highly scalable, distributes load | Increased infrastructure cost, replication lag |

---

## Stage 5: Scalable Notification System

### Issues in Sequential Notification Delivery

The original approach of sending notifications one by one has several problems:
- Sequential execution is slow for large user bases
- No retry mechanism for failed deliveries
- Missing error handling
- Cannot scale to 50,000+ users efficiently

### Proposed Queue-Based Architecture

A message queue system allows for parallel processing and better fault tolerance.

#### System Flow

1. HR triggers the `notify_all` function
2. Individual notification jobs are added to a queue
3. Multiple workers process jobs concurrently:
   - Email worker sends email notifications
   - Database worker stores notifications
   - Push notification worker sends mobile/web push
4. Failed jobs are automatically retried

#### Implementation Pseudocode

```javascript
function notify_all(student_ids, message) {
  for (student_id of student_ids) {
    enqueue_job({
      student_id: student_id,
      message: message
    });
  }
}

function worker() {
  while (true) {
    job = get_job_from_queue();
    
    try {
      save_to_database(job);
      send_email(job);
      send_push_notification(job);
      mark_job_complete(job);
    } catch (error) {
      retry_job(job);
    }
  }
}
```

### Benefits
- Parallel processing dramatically improves speed
- Built-in retry mechanisms handle transient failures
- Easy to scale by adding more workers
- Better monitoring and observability

---

## Stage 6: Priority Notification System

### The Problem
Users should see the most important unread notifications first, based on:
- **Type Weight**: Placement notifications are more important than events
- **Recency**: Newer notifications take priority over older ones

### Approach

1. Fetch notifications from the API
2. Assign weight based on type:
   - Placement → 3
   - Result → 2
   - Event → 1
3. Calculate priority score:
   ```
   score = weight + recency_factor
   ```
4. Use a **Min Heap** to maintain the top 10 notifications
5. Return sorted results to the user

### Why Use a Min Heap?

A Min Heap is ideal for this use case because:
- Efficiently maintains the top-k elements
- Time complexity of O(n log k) for processing n notifications
- Avoids sorting the entire dataset
- Works well with streaming data

### Handling Continuous Data

As new notifications arrive:
1. Compare the new notification's priority with the minimum in the heap
2. If the new notification has higher priority, replace the minimum
3. This ensures the top 10 is always up to date

### Complexity Analysis

- **Time Complexity**: O(n log k) where n is total notifications and k is the heap size (10)
- **Space Complexity**: O(k) for storing the heap

This approach is much more efficient than sorting all notifications, especially as the dataset grows.

---
```