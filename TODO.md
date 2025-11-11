# TODO: Store Career Page Chat History in DB

## Tasks
- [x] Modify `frontend/app/career/page.tsx` to create a session on page load and save chat messages to DB
- [ ] Test career chat history appears in client history page
- [ ] Verify feedback is visible on admin side (if not, implement)
- [ ] Test admin can view career chats

## Details
- On career page load: Verify token, create session via API, store sessionId
- In handleAsk: Save user question as chat before streaming AI response
- After AI response: Save bot answer as chat
- Ensure feedback submission from career page (if applicable) is visible to admin
