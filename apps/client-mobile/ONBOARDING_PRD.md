# Mobile App Onboarding Flow - Product Requirements Document

## Overview

A simple and concise onboarding flow for the EboxSecure mobile app that guides users through account creation, photo capture, and payment setup using a horizontal swipe carousel interface.

## Core Requirements

### Navigation

- **Type**: Horizontal swipe carousel with programmatic navigation
- **Direction**: Left/right swipe gestures
- **Back Navigation**: Users can return to previous steps
- **Progress Indicator**: Visual progress bar showing completion status

### Flow Order

1. **Account Creation** (Step 1)
2. **Photo Capture** (Step 2)
3. **Payment Setup** (Step 3)

## Phase 1: Foundation & Navigation

### Components to Create

1. **OnboardingCarousel** - Main container for horizontal scrolling
2. **OnboardingProgress** - Progress indicator component
3. **OnboardingContext** - State management for navigation
4. **OnboardingStep** - Reusable step wrapper component

### Features

- Horizontal FlatList with paging enabled
- Smooth scroll animations using react-native-reanimated
- Progress indicator showing current step (1/3, 2/3, 3/3)
- Context-based navigation state management
- Basic step navigation (next, previous, go to specific step)

### Technical Stack

- `react-native-reanimated` for animations
- `react-native-gesture-handler` for swipe gestures
- React Context for state management
- Expo Router for navigation integration

### Deliverables

- [ ] OnboardingCarousel component
- [ ] OnboardingProgress component
- [ ] OnboardingContext provider
- [ ] OnboardingStep wrapper component
- [ ] Basic navigation structure
- [ ] Progress indicator integration

---

## Phase 2: Account Creation Step

### Features

- **Clerk Integration**: Use Clerk's mobile SDK for authentication
- **Form Fields**: Email, password, name (first/last)
- **Validation**: Real-time form validation
- **Error Handling**: Display validation errors clearly
- **Loading States**: Show loading during account creation

### UI Elements

- EboxSecure logo and branding
- Form inputs with proper styling
- Validation error messages
- "Create Account" button with loading state
- Skip option (if needed)

### Technical Implementation

- Integrate `@clerk/clerk-expo` SDK
- Form validation using React Hook Form or similar
- Error handling for network issues
- Secure storage for user session

### Deliverables

- [ ] Account creation form component
- [ ] Clerk SDK integration
- [ ] Form validation logic
- [ ] Error handling and user feedback
- [ ] Loading states and transitions

---

## Phase 3: Photo Capture Step

### Features

- **Camera Integration**: Use expo-image-picker for camera access
- **Gallery Selection**: Allow users to choose from photo library
- **Photo Preview**: Show captured/selected photo
- **Retake Option**: Allow users to retake/select different photo
- **Basic Validation**: Ensure photo is captured/selected

### UI Elements

- Camera/gallery selection buttons
- Photo preview area (circular or rectangular)
- Photo guidelines/requirements text
- "Take Photo" and "Choose from Gallery" buttons
- "Continue" button (enabled only when photo is selected)

### Technical Implementation

- `expo-image-picker` for camera and gallery access
- Permission handling for camera and photo library
- Local photo storage (no backend integration yet)
- Photo compression and optimization

### Deliverables

- [ ] Photo capture component
- [ ] Camera and gallery integration
- [ ] Permission handling
- [ ] Photo preview functionality
- [ ] Local photo storage

---

## Phase 4: Payment Setup Step

### Features

- **Stripe Payment Sheet**: Use Stripe's Payment Sheet UI component
- **Payment Methods**: Support credit cards and other payment methods
- **Subscription Plans**: Display available subscription options
- **Payment Processing**: Handle payment submission and confirmation
- **Error Handling**: Graceful handling of payment failures

### UI Elements

- Subscription plan selection
- Stripe Payment Sheet integration
- Payment confirmation screen
- Error messages for failed payments
- "Complete Payment" button

### Technical Implementation

- `@stripe/stripe-react-native` for Payment Sheet
- Subscription plan data (hardcoded for now)
- Payment state management
- Success/failure handling

### Deliverables

- [ ] Payment setup component
- [ ] Stripe Payment Sheet integration
- [ ] Subscription plan display
- [ ] Payment processing logic
- [ ] Success/failure handling

---

## Phase 5: Integration & Polish

### Features

- **Flow Completion**: Mark onboarding as complete
- **Navigation to Main App**: Redirect to main app after completion
- **State Persistence**: Save onboarding completion status
- **Error Recovery**: Handle edge cases and errors gracefully
- **Loading States**: Smooth transitions between steps

### Technical Implementation

- Secure storage for onboarding completion
- Integration with main app navigation
- Error boundary implementation
- Performance optimization

### Deliverables

- [ ] Onboarding completion logic
- [ ] Main app integration
- [ ] Error recovery mechanisms
- [ ] Performance optimization
- [ ] Final testing and polish

---

## Technical Specifications

### Dependencies

```json
{
  "@clerk/clerk-expo": "^0.20.0",
  "@stripe/stripe-react-native": "^0.35.0",
  "expo-image-picker": "^14.0.0",
  "react-native-reanimated": "^3.0.0",
  "react-native-gesture-handler": "^2.0.0",
  "expo-secure-store": "^12.0.0"
}
```

### File Structure

```
apps/client-mobile/
├── app/onboarding/
│   ├── _layout.tsx              # Onboarding layout
│   └── index.tsx                # Main onboarding flow
├── components/
│   ├── OnboardingCarousel.tsx   # Horizontal carousel
│   ├── OnboardingProgress.tsx   # Progress indicator
│   └── onboarding/
│       ├── OnboardingStep.tsx   # Step wrapper
│       ├── OnboardingContext.tsx # State management
│       ├── AccountStep.tsx      # Account creation
│       ├── PhotoStep.tsx        # Photo capture
│       └── PaymentStep.tsx      # Payment setup
└── hooks/
    └── useOnboarding.ts         # Onboarding utilities
```

### State Management

- **Context State**: Navigation, current step, completion status
- **Local State**: Form data, photo URI, payment status
- **Persistent State**: Onboarding completion, user session

### Error Handling

- Network connectivity issues
- Permission denials
- Payment failures
- Form validation errors
- API errors (when backend is integrated)

### Accessibility

- Screen reader support
- Keyboard navigation
- High contrast support
- Proper touch targets

---

## Success Metrics

### User Experience

- Onboarding completion rate
- Time to complete onboarding
- Drop-off points identification
- User satisfaction scores

### Technical Performance

- App load time
- Step transition smoothness
- Memory usage
- Crash rate during onboarding

---

## Future Enhancements

### Phase 6: Backend Integration

- Photo upload to server
- User profile creation
- Payment webhook handling
- Analytics tracking

### Phase 7: Advanced Features

- A/B testing for different flows
- Personalized onboarding
- Social login options
- Offline support

---

## Testing Strategy

### Manual Testing

- [ ] Swipe navigation works on all devices
- [ ] Account creation completes successfully
- [ ] Photo capture and selection work
- [ ] Payment processing completes
- [ ] Error states are handled gracefully
- [ ] Progress indicator updates correctly

### Automated Testing

- [ ] Unit tests for components
- [ ] Integration tests for flow
- [ ] E2E tests for complete onboarding

---

## Deployment Considerations

### Environment Setup

- Clerk configuration for mobile
- Stripe configuration for Payment Sheet
- Environment variables for API endpoints

### App Store Requirements

- Privacy policy updates
- Permission usage descriptions
- App store screenshots and descriptions

---

## Risk Assessment

### Technical Risks

- **Stripe Integration**: Payment processing failures
- **Clerk Integration**: Authentication issues
- **Camera Permissions**: User denial of camera access
- **Network Issues**: Poor connectivity during onboarding

### Mitigation Strategies

- Comprehensive error handling
- Offline fallback options
- Graceful degradation
- User-friendly error messages

---

## Timeline Estimate

- **Phase 1**: 2-3 days (Foundation & Navigation)
- **Phase 2**: 2-3 days (Account Creation)
- **Phase 3**: 2-3 days (Photo Capture)
- **Phase 4**: 2-3 days (Payment Setup)
- **Phase 5**: 1-2 days (Integration & Polish)

**Total Estimated Time**: 9-14 days

---

## Dependencies

### External Services

- Clerk Authentication
- Stripe Payment Processing
- Expo SDK services

### Internal Dependencies

- Existing UI components
- Navigation system
- State management patterns
- Error handling utilities

---

This PRD provides a comprehensive roadmap for implementing a simple, effective onboarding flow that meets all specified requirements while maintaining flexibility for future enhancements.
