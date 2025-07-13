# Test Guide: Rejected Post Edit UI

## 🎯 Test Objective

Verify that users can edit rejected posts through the new UI in MyPostsPage.

## 📋 Test Steps

### Prerequisites

1. Have a user account with some rejected posts
2. Make sure posts have rejection reasons
3. Access `/user/my-posts` page

### Test Case 1: UI Elements Display

**Expected Results:**

- [ ] Rejected posts show "Bị từ chối" status in red badge
- [ ] Rejection reason column displays the reason text
- [ ] "Cần chỉnh sửa" badge appears next to rejection reason
- [ ] Red "Chỉnh sửa" button appears for rejected posts
- [ ] Button has proper tooltip: "Chỉnh sửa bài viết bị từ chối để gửi lại duyệt"

### Test Case 2: Rejected Post Edit Flow

**Steps:**

1. Click "Chỉnh sửa" button on a rejected post
2. Verify navigation to EditPostPage
3. Check if rejection reason is displayed in EditPostPage
4. Make some changes to the post
5. Submit the form

**Expected Results:**

- [ ] Successfully navigates to `/user/posts/edit/{post_id}`
- [ ] EditPostPage shows rejection reason in red box
- [ ] After submission, shows success message about resubmission
- [ ] Post status changes from "rejected" to "waiting"
- [ ] rejection_reason is cleared in backend

### Test Case 3: Waiting Post Edit

**Expected Results:**

- [ ] Waiting posts show yellow "Chỉnh sửa" button
- [ ] Tooltip: "Chỉnh sửa bài viết đang chờ duyệt"
- [ ] Edit flow works similarly to rejected posts

### Test Case 4: Approved Post Edit

**Expected Results:**

- [ ] Shows green "Cập nhật" button
- [ ] Shows "Xem công khai" button with ExternalLink icon
- [ ] Tooltip: "Cập nhật bài viết sẽ chuyển về trạng thái chờ duyệt"

### Test Case 5: Responsive Design

**Test on different screen sizes:**

- [ ] Mobile: Buttons stack properly
- [ ] Tablet: Actions remain accessible
- [ ] Desktop: All elements display correctly

## 🐛 Common Issues to Check

### UI Issues

- [ ] Icons load properly (ExternalLink icon)
- [ ] Colors match design (red for rejected, yellow for waiting, green for approved)
- [ ] Tooltips show on hover
- [ ] Badge spacing and sizing

### Functional Issues

- [ ] Navigation works correctly
- [ ] Edit functionality maintains all post data
- [ ] Status changes work as expected
- [ ] Error handling for API failures

## 📱 Browser Testing

Test on:

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers

## 🎨 Visual Testing

Compare with design:

- [ ] Button styling matches design system
- [ ] Colors are accessible (proper contrast)
- [ ] Spacing and layout are consistent
- [ ] Typography is readable

## ✅ Sign-off

- [ ] All test cases pass
- [ ] No console errors
- [ ] No accessibility violations
- [ ] Performance is acceptable

**Tested by:** ******\_******  
**Date:** ******\_******  
**Notes:** ******\_******
