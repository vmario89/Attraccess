# Attraccess Component Checklist

This document lists all the frontend components in the Attraccess application, organized by their files.

## App Structure

- [ ] `apps/frontend/src/app/app.tsx`

  - [ ] App

- [ ] `apps/frontend/src/app/layout/layout.tsx`

  - [ ] Layout

- [ ] `apps/frontend/src/app/layout/header.tsx`

  - [ ] Header

- [ ] `apps/frontend/src/app/layout/sidebar.tsx`

  - [ ] Sidebar

- [ ] `apps/frontend/src/app/loading.tsx`

  - [ ] Loading

- [ ] `apps/frontend/src/app/routes/index.tsx`
  - [ ] routes (constant)

## Resource Management

- [ ] `apps/frontend/src/app/resources/list.tsx`

  - [ ] ResourceList

- [ ] `apps/frontend/src/app/resources/toolbar.tsx`

  - [ ] Toolbar

- [ ] `apps/frontend/src/app/resources/resourceCard.tsx`

  - [ ] ResourceCard
  - [ ] ResourceCardSkeletonLoader

- [ ] `apps/frontend/src/app/resources/resourceCreateModal.tsx`

  - [ ] ResourceCreateModal

- [ ] `apps/frontend/src/app/resources/resourceDetails.tsx`

  - [ ] ResourceDetailsComponent
  - [ ] ResourceDetails (memoized)

- [ ] `apps/frontend/src/app/resources/iotSettings.tsx`
  - [ ] IoTSettings

## MQTT Integration

- [ ] `apps/frontend/src/app/mqtt/MqttServersPage.tsx`

  - [ ] MqttServersPage

- [ ] `apps/frontend/src/app/mqtt/servers/MqttServersList.tsx`

  - [ ] MqttServersList

- [ ] `apps/frontend/src/app/resources/mqtt/MqttConfigurationPanel.tsx`
  - [ ] MqttConfigurationPanel

## Resource Usage

- [ ] `apps/frontend/src/app/resources/usage/resourceUsageSession.tsx`

  - [ ] ResourceUsageSession

- [ ] `apps/frontend/src/app/resources/usage/resourceUsageHistory.tsx`

  - [ ] ResourceUsageHistory

- [ ] `apps/frontend/src/app/resources/usage/components/HistoryHeader/index.tsx`

  - [ ] HistoryHeader

- [ ] `apps/frontend/src/app/resources/usage/components/HistoryPagination/index.tsx`

  - [ ] HistoryPagination

- [ ] `apps/frontend/src/app/resources/usage/components/HistoryTable/index.tsx`

  - [ ] HistoryTable

- [ ] `apps/frontend/src/app/resources/usage/components/HistoryTable/utils/tableHeaders.tsx`

  - [ ] generateHeaderColumns (function)

- [ ] `apps/frontend/src/app/resources/usage/components/HistoryTable/utils/tableRows.tsx`

  - [ ] generateRowCells (function)

- [ ] `apps/frontend/src/app/resources/usage/components/SessionNotesModal/index.tsx`

  - [ ] SessionNotesModal

- [ ] `apps/frontend/src/app/resources/usage/components/UsageNotesModal/index.tsx`
  - [ ] UsageNotesModal

## Resource Introductions

- [ ] `apps/frontend/src/app/resources/introductions/resourceIntroductions.tsx`

  - [ ] ResourceIntroductions

- [ ] `apps/frontend/src/app/resources/introductions/resourceIntroductionsFlow.test.tsx` (test file)

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsSkeleton/index.tsx`

  - [ ] IntroductionsSkeleton

- [ ] `apps/frontend/src/app/resources/introductions/components/AddIntroductionForm/index.tsx`

  - [ ] AddIntroductionForm

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/index.tsx`

  - [ ] IntroductionsList

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionListItemContent/index.tsx`

  - [ ] IntroductionListItemContent

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionListItemActions/index.tsx`

  - [ ] IntroductionListItemActions

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/RevokeConfirmationDialog/index.tsx`

  - [ ] RevokeConfirmationDialog

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionHistoryDialog/index.tsx`

  - [ ] IntroductionHistoryDialog

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionHistoryDialog/components/EmptyState/index.tsx`

  - [ ] EmptyState

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionHistoryDialog/components/HistoryComment/index.tsx`

  - [ ] HistoryComment

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionHistoryDialog/components/HistoryItem/index.tsx`

  - [ ] HistoryItem

- [ ] `apps/frontend/src/app/resources/introductions/components/IntroductionsList/components/IntroductionHistoryDialog/components/LoadingState.tsx`
  - [ ] LoadingState

## Introducers Management

- [ ] `apps/frontend/src/app/resources/introductions/components/ManageIntroducers/index.tsx`

  - [ ] ManageIntroducersComponent
  - [ ] ManageIntroducers (memoized)

- [ ] `apps/frontend/src/app/resources/introductions/components/ManageIntroducers/components/AddIntroducer.tsx`

  - [ ] AddIntroducerComponent
  - [ ] AddIntroducer (memoized)

- [ ] `apps/frontend/src/app/resources/introductions/components/ManageIntroducers/components/IntroducersList.tsx`
  - [ ] IntroducersList

## Authentication

- [ ] `apps/frontend/src/app/unauthorized/layout.tsx`

  - [ ] UnauthorizedLayout

- [ ] `apps/frontend/src/app/unauthorized/unauthorized.tsx`

  - [ ] Unauthorized

- [ ] `apps/frontend/src/app/unauthorized/loginForm.tsx`

  - [ ] LoginForm

- [ ] `apps/frontend/src/app/unauthorized/registrationForm.tsx`

  - [ ] RegistrationForm

- [ ] `apps/frontend/src/app/verifyEmail.tsx`
  - [ ] VerifyEmail

## Shared Components

- [ ] `apps/frontend/src/components/AttraccessUser.tsx`

  - [ ] AttraccessUser

- [ ] `apps/frontend/src/components/DateTimeDisplay.tsx`

  - [ ] DateTimeDisplay

- [ ] `apps/frontend/src/components/deleteConfirmationModal.tsx`

  - [ ] DeleteConfirmationModal

- [ ] `apps/frontend/src/components/DurationDisplay.tsx`

  - [ ] DurationDisplay

- [ ] `apps/frontend/src/components/fileUpload.tsx`

  - [ ] FileUpload

- [ ] `apps/frontend/src/components/pageHeader.tsx`

  - [ ] PageHeader

- [ ] `apps/frontend/src/components/userSearch.tsx`
  - [ ] UserSearch

## Test Utilities

- [ ] `apps/frontend/src/test-utils/wrappers.tsx`
  - [ ] TestWrapper
  - [ ] QueryWrapper
  - [ ] RouterWrapper

## Entry Point

- [ ] `apps/frontend/src/main.tsx` (App entry point)
