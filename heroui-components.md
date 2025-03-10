# HeroUI Components

This document provides a comprehensive list of all available HeroUI components, including a short description and their props.

## Table of Contents

- [Accordion](#accordion)
- [Autocomplete](#autocomplete)
- [Alert](#alert)
- [Avatar](#avatar)
- [Badge](#badge)
- [Breadcrumbs](#breadcrumbs)
- [Button](#button)
- [Calendar](#calendar)
- [Card](#card)
- [Checkbox](#checkbox)
- [Checkbox Group](#checkbox-group)
- [Chip](#chip)
- [Circular Progress](#circular-progress)
- [Code](#code)
- [Date Input](#date-input)
- [Date Picker](#date-picker)
- [Date Range Picker](#date-range-picker)
- [Divider](#divider)
- [Dropdown](#dropdown)
- [Drawer](#drawer)
- [Form](#form)
- [Image](#image)
- [Input](#input)
- [Input OTP](#input-otp)
- [Kbd](#kbd)
- [Link](#link)
- [Listbox](#listbox)
- [Modal](#modal)
- [Navbar](#navbar)
- [Number Input](#number-input)
- [Pagination](#pagination)
- [Popover](#popover)
- [Progress](#progress)
- [Radio Group](#radio-group)
- [Range Calendar](#range-calendar)
- [Scroll Shadow](#scroll-shadow)
- [Select](#select)
- [Skeleton](#skeleton)
- [Slider](#slider)
- [Snippet](#snippet)
- [Spacer](#spacer)
- [Spinner](#spinner)
- [Switch](#switch)
- [Table](#table)
- [Tabs](#tabs)
- [Toast](#toast)
- [Textarea](#textarea)
- [Time Input](#time-input)
- [Tooltip](#tooltip)
- [User](#user)

## Accordion

A vertically stacked set of interactive headings that each reveal a section of content.

**Props:**

- `variant`: The visual style of the accordion
- `isDisabled`: Whether the accordion is disabled
- `selectionMode`: Determines whether multiple items can be expanded at once
- `defaultExpandedKeys`: The keys of the items that should be expanded by default
- `expandedKeys`: Controlled expanded state of the accordion items
- `onExpandedChange`: Callback function called when the expanded state changes

## Autocomplete

An input component with a dropdown list of suggested options.

**Props:**

- `options`: The list of options to display
- `onInputChange`: Callback when the input value changes
- `onSelectionChange`: Callback when an option is selected
- `isDisabled`: Whether the autocomplete is disabled
- `placeholder`: Placeholder text for the input

## Alert

Used to display important messages to the user in a prominent way.

**Props:**

- `variant`: Visual appearance of the alert
- `color`: Color variant of the alert (primary, secondary, success, warning, danger)
- `isOpen`: Controls whether the alert is displayed
- `onClose`: Callback when the close button is clicked
- `title`: The title text of the alert
- `icon`: Custom icon to display in the alert

## Avatar

Represents a user or entity with an image, icon, or initials.

**Props:**

- `src`: URL of the image
- `name`: Name used to generate initials if no image is available
- `size`: Size of the avatar (sm, md, lg, xl)
- `color`: Color scheme of the avatar
- `radius`: Radius of the avatar (none, sm, md, lg, full)
- `showFallback`: Whether to show a fallback when image fails to load
- `fallback`: Custom fallback element

## Badge

Used to highlight or display counts, statuses, or category information.

**Props:**

- `content`: The content to display in the badge
- `color`: Color of the badge (primary, secondary, success, warning, danger)
- `variant`: Visual style of the badge (solid, bordered, flat)
- `size`: Size of the badge (sm, md, lg)
- `isInvisible`: Whether the badge is hidden
- `shape`: Shape of the badge (circle, rectangle)
- `placement`: Position of the badge when used with children

## Breadcrumbs

Shows the location of the current page in the navigation hierarchy.

**Props:**

- `items`: Array of breadcrumb items
- `separator`: Custom separator between items
- `size`: Size of the breadcrumbs (sm, md, lg)
- `radius`: Border radius of the breadcrumbs
- `variant`: Visual style of the breadcrumbs
- `onAction`: Callback when a breadcrumb item is clicked

## Button

Triggers an action or event when clicked by the user.

**Props:**

- `variant`: Visual style of the button (solid, bordered, light, flat, faded, shadow, ghost)
- `color`: Color scheme (primary, secondary, success, warning, danger)
- `size`: Size of the button (sm, md, lg)
- `radius`: Border radius (none, sm, md, lg, full)
- `isDisabled`: Whether the button is disabled
- `isLoading`: Whether the button is in a loading state
- `startContent`: Content to display before the button label
- `endContent`: Content to display after the button label
- `fullWidth`: Whether the button takes the full width of its container
- `onPress`: Callback when the button is pressed

## Calendar

Displays a calendar grid for date selection.

**Props:**

- `minValue`: Minimum selectable date
- `maxValue`: Maximum selectable date
- `defaultValue`: Default selected date
- `value`: Controlled selected date
- `onChange`: Callback when the selected date changes
- `isDisabled`: Whether the calendar is disabled
- `isReadOnly`: Whether the calendar is read-only
- `visibleMonths`: Number of months to display simultaneously

## Card

A flexible container component for grouping related content and actions.

**Props:**

- `variant`: Visual style of the card (flat, bordered, shadow)
- `radius`: Border radius (none, sm, md, lg)
- `shadow`: Shadow intensity (none, sm, md, lg)
- `isPressable`: Whether the card is clickable
- `isHoverable`: Whether the card has hover effects
- `isFooterBlurred`: Whether the footer has a blur effect
- `disableAnimation`: Whether to disable animations
- `onPress`: Callback when the card is pressed

## Link

Links allow users to click their way from page to page. This component is styled to resemble a hyperlink and semantically renders an `<a>`.

**Props:**

- `size`: Size of the link (sm, md, lg) - Default: "md"
- `color`: Color of the link (foreground, primary, secondary, success, warning, danger) - Default: "primary"
- `underline`: Underline style (none, hover, always, active, focus) - Default: "none"
- `href`: URL to navigate to
- `target`: Target attribute for the anchor tag
- `rel`: Rel attribute for the anchor tag
- `download`: Download attribute for the anchor tag
- `ping`: Ping attribute for the anchor tag
- `referrerPolicy`: Referrer policy for the anchor tag
- `isExternal`: Whether the link points to an external resource - Default: false
- `showAnchorIcon`: Whether to show an anchor icon - Default: false
- `anchorIcon`: Custom anchor icon
- `isBlock`: Whether the link should display as a block - Default: false
- `isDisabled`: Whether the link is disabled - Default: false
- `disableAnimation`: Whether to disable animations - Default: false

**Events:**

- `onPress`: Callback when the link is pressed
- `onPressStart`: Callback when press starts
- `onPressEnd`: Callback when press ends
- `onPressChange`: Callback when press state changes
- `onPressUp`: Callback when press up occurs
- `onKeyDown`: Callback when a key is pressed down
- `onKeyUp`: Callback when a key is released
- `onClick`: Callback when the link is clicked

## Date Picker

DatePickers combine a DateInput and a Calendar popover to allow users to enter or select a date and time value.

**Props:**

- Similar to Calendar with additional input-related props
- `placeholder`: Placeholder text for the input
- `popoverProps`: Props for the popover component
- `isOpen`: Whether the calendar popover is open
- `onOpenChange`: Callback when the open state changes

## Toast

A brief, non-blocking notification message that appears at the edges of the interface.

**Props:**

- `title`: Title of the toast
- `description`: Description text of the toast
- `variant`: Visual style of the toast
- `color`: Color scheme of the toast
- `duration`: Duration in milliseconds before the toast disappears
- `isOpen`: Controls whether the toast is shown
- `onOpenChange`: Callback when the open state changes
- `position`: Position of the toast on the screen

## Checkbox

A form element that allows the user to select one or more options from a set.

**Props:**

- `isSelected`: Whether the checkbox is selected
- `defaultSelected`: Default selected state
- `onValueChange`: Callback when the selected state changes
- `value`: Value associated with the checkbox
- `isDisabled`: Whether the checkbox is disabled
- `isIndeterminate`: Whether the checkbox is in an indeterminate state
- `size`: Size of the checkbox (sm, md, lg)
- `color`: Color scheme of the checkbox

## Input

A form element that allows users to input text data.

**Props:**

- `value`: Controlled value of the input
- `defaultValue`: Default value of the input
- `type`: Type of the input (text, password, email, etc.)
- `placeholder`: Placeholder text
- `size`: Size of the input (sm, md, lg)
- `variant`: Visual style of the input (flat, bordered, underlined, faded)
- `color`: Color scheme of the input
- `isDisabled`: Whether the input is disabled
- `isReadOnly`: Whether the input is read-only
- `isRequired`: Whether the input is required
- `isInvalid`: Whether the input has an error
- `startContent`: Content to display at the start of the input
- `endContent`: Content to display at the end of the input
- `onValueChange`: Callback when the value changes

## Select

A form element that allows users to choose an option from a dropdown list.

**Props:**

- `items`: Array of items to display
- `selectedKeys`: Currently selected keys
- `defaultSelectedKeys`: Default selected keys
- `onSelectionChange`: Callback when the selection changes
- `placeholder`: Placeholder text
- `isDisabled`: Whether the select is disabled
- `isRequired`: Whether the select is required
- `size`: Size of the select (sm, md, lg)
- `variant`: Visual style of the select
- `color`: Color scheme of the select

## Switch

A toggle switch that allows users to turn an option on or off.

**Props:**

- `isSelected`: Whether the switch is selected
- `defaultSelected`: Default selected state
- `onValueChange`: Callback when the selected state changes
- `size`: Size of the switch (sm, md, lg)
- `color`: Color scheme of the switch
- `isDisabled`: Whether the switch is disabled
- `thumbIcon`: Custom icon for the thumb

## Table

Displays data in a tabular format with rows and columns.

**Props:**

- `aria-label`: Accessibility label for the table
- `selectionMode`: Type of selection (single, multiple, none)
- `selectedKeys`: Currently selected keys
- `onSelectionChange`: Callback when the selection changes
- `sortDescriptor`: Current sort state
- `onSortChange`: Callback when the sort changes
- `topContent`: Content to display above the table
- `bottomContent`: Content to display below the table
- `classNames`: Custom class names for various table parts

## Tabs

A set of layered sections of content that display one panel at a time.

**Props:**

- `aria-label`: Accessibility label for the tabs
- `selectedKey`: Key of the selected tab
- `defaultSelectedKey`: Default selected key
- `onSelectionChange`: Callback when the selected tab changes
- `variant`: Visual style of the tabs
- `color`: Color scheme of the tabs
- `size`: Size of the tabs (sm, md, lg)
- `disabledKeys`: Keys of disabled tabs
- `disableAnimation`: Whether to disable animations

## Textarea

A multi-line text input field for longer text entries.

**Props:**

- `value`: Controlled value of the textarea
- `defaultValue`: Default value of the textarea
- `placeholder`: Placeholder text
- `rows`: Number of visible rows
- `maxRows`: Maximum number of rows before scrolling
- `minRows`: Minimum number of rows
- `size`: Size of the textarea (sm, md, lg)
- `variant`: Visual style of the textarea
- `color`: Color scheme of the textarea
- `isDisabled`: Whether the textarea is disabled
- `isReadOnly`: Whether the textarea is read-only
- `isRequired`: Whether the textarea is required
- `isInvalid`: Whether the textarea has an error
- `onValueChange`: Callback when the value changes

## Tooltip

A small popup that displays information when users hover over or focus on an element.

**Props:**

- `content`: The content to display in the tooltip
- `placement`: Position of the tooltip relative to the trigger
- `delay`: Delay before showing/hiding the tooltip
- `isOpen`: Controls whether the tooltip is shown
- `onOpenChange`: Callback when the open state changes
- `color`: Color scheme of the tooltip
- `size`: Size of the tooltip (sm, md, lg)
- `offset`: Offset from the trigger element
- `showArrow`: Whether to show an arrow pointing to the trigger

## User

A component for displaying user information in a standardized format.

**Props:**

- `name`: User's name
- `description`: Additional user description or role
- `avatarProps`: Props for the avatar component
- `isFocusable`: Whether the component can receive focus
- `isDisabled`: Whether the component is disabled
- `isLoaded`: Whether the component has loaded

## Modal

A dialog that appears on top of the main content and requires user interaction.

**Props:**

- `isOpen`: Controls whether the modal is shown
- `onOpenChange`: Callback when the open state changes
- `placement`: Position of the modal on the screen
- `size`: Size of the modal (xs, sm, md, lg, xl, full)
- `scrollBehavior`: How content scrolls within the modal
- `hideCloseButton`: Whether to hide the close button
- `isDismissable`: Whether clicking the backdrop closes the modal
- `backdrop`: Type of backdrop (blur, opaque, transparent)

## Slider

Allows users to select a value or range from a specified range of values.

**Props:**

- `value`: Controlled value of the slider
- `defaultValue`: Default value of the slider
- `min`: Minimum value
- `max`: Maximum value
- `step`: Step value
- `orientation`: Orientation of the slider (horizontal, vertical)
- `size`: Size of the slider (sm, md, lg)
- `color`: Color scheme of the slider
- `isDisabled`: Whether the slider is disabled
- `showSteps`: Whether to show step markers
- `onValueChange`: Callback when the value changes

## Popover

A small overlay that appears relative to a trigger element.

**Props:**

- `isOpen`: Controls whether the popover is shown
- `onOpenChange`: Callback when the open state changes
- `placement`: Position of the popover relative to the trigger
- `offset`: Offset from the trigger element
- `showArrow`: Whether to show an arrow pointing to the trigger
- `backdrop`: Type of backdrop (blur, opaque, transparent, none)
- `triggerType`: How the popover is triggered (press, hover)
- `isDismissable`: Whether clicking outside closes the popover

## Drawer

A panel that slides in from the edge of the screen.

**Props:**

- `isOpen`: Controls whether the drawer is shown
- `onOpenChange`: Callback when the open state changes
- `placement`: Side from which the drawer appears
- `size`: Size of the drawer
- `backdrop`: Type of backdrop
- `hideCloseButton`: Whether to hide the close button
- `isDismissable`: Whether clicking the backdrop closes the drawer
- `isKeyboardDismissDisabled`: Whether keyboard dismissal is disabled

## Spinner

Visual indicator of a loading state.

**Props:**

- `size`: Size of the spinner (sm, md, lg)
- `color`: Color scheme of the spinner
- `labelColor`: Color of the label
- `label`: Text label for the spinner
- `labelPlacement`: Placement of the label (start, end, top, bottom)
- `classNames`: Custom class names for various spinner parts
