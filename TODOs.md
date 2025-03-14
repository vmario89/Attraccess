# TODOs

- [ ] Feature: Backend (especially email) i18n

  - Frontend login should contain users language which is then persisted in db user object

- [ ] Feature: Maintenance Schedules

  - Users with resource manage permission can create / update Schedules
  - Users with resource manage permission as well as users who are maintainers of a resource can see schedules of a resource
  - Schedules are either real-time based, usage hours based, usages (count) based or any combination of these (first to match sets the maintenance status)
  - If a maintenance is active, the resource can no longer be used by normal users (block usage sessions)
  - Active usage sessions are NOT terminated if during them a maintenance condition becomes active, the maintenance starts afterwards
  - Users who are maintainers of the resource can still start and stop the machine during maintenance
  - Users who are maintainers can mark an active maintenance schedule as done
  - Each maintenance which was done is tracked and a history is shown (to all users) in the UI
  - Each maintenance which was done can have a note (optional) from the maintainer

- [ ] Feature: Manual disabling/maintenance of a resource

  - Users with manage resource permissions as well as resource maintainers can manually set a resource to "in maintenance", they need to specify a note describing why the resource is going in maintenance
  - If the resource is in maintenance, it can only be used by users who are maintainers
  - Only users with manage resource permission as well as resource maintainers can remove the maintenance status
  - This manual action is logged in the same maintenance history as the normal maintenance schedules (in the UI, does not need to be the same in the db)

- [ ] Deployment: Figure out how to deploy/ship using bytenode

- [ ] Monitoring / Notifications on system errors/when system is down

- [ ] Usage Agreements per machine before first machine use has to be accepted by user

- [ ] NFC / Token login/usage

- [ ] Resource groups. enable introductions for a whole group of resources

- [ ] Pay for use (per hour, by custom parameters or even smart devices (e.g. integrate a smart filament scale))

- [ ] Bug: multiple users can start a session
