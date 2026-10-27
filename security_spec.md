# Security Specification for Foro Alterno

## Data Invariants
1. **Thread Integrity**: A thread can only be created by an authenticated user where `authorId == request.auth.uid`. Threads require a non-empty title (>= 3 chars, <= 150 chars) and content (>= 2 chars, <= 20000 chars).
2. **Reply Integrity**: A reply must belong to an existing thread id and can only be authored by `authorId == request.auth.uid`.
3. **Like Uniqueness**: A user cannot forge likes on behalf of other users; `userId == request.auth.uid`.
4. **User Profile**: Users can update their own display name, bio, and custom title, but cannot self-assign the `admin` role or spoof another user's UID.
5. **Public Reads**: Forum categories, threads, and replies are readable by guests and members alike (public community forum), while write access strictly requires authentication.

## The "Dirty Dozen" Threat Payloads
1. Attempt to create a thread with spoofed `authorId` ("other_user_id").
2. Attempt to create a thread without authentication.
3. Attempt to inject a 100KB string into the thread `title`.
4. Attempt to self-assign role: "admin" in `user_profiles`.
5. Attempt to update another user's post or thread title.
6. Attempt to delete another user's thread when not admin.
7. Attempt to post a reply with empty content or spoofed UID.
8. Attempt to like a post with another user's `userId`.
9. Attempt to poison path variables with non-alphanumeric special characters.
10. Attempt to inject arbitrary ghost properties during document creation.
11. Attempt to decrement replyCount to negative values.
12. Attempt to bypass rate limits or tamper with server-authoritative timestamps.
