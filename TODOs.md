# TODO's

[ ] Feature: Backend (especially email) i18n
    - frontend login should contain users language which is then persisted in db user object
[ ] Feature: MQTT support
    - configure resources to broadcast their usage statuses to certain mqtt servers and channels (configurable per resource)
[ ] Feature: ESPHome integration
    - esphome compiler in the ui (user has to host themself and just provide a hosting url for embedding in our frontend, we dont manage it ourself)
    - esphome module/plugin for easy integration with our resurces
[ ] Feature:
[ ] Feature: System administrators can add SSO providers
    - users can use these to login
    - roles from these sso providers can be mapped to system permissions and are kept in sync from that point on
    - if roles are synced, they can no longer be manually changed
[ ] Feature: Maintenance Schedules
    - Users with resource manage permission can create / update Schedules
    - Users with resource manage permission as well as users who are maintainers of a resource can see schedules of a resource
    - Schedules are either real-time based, usage hours based, usages (count) based or any combination of these (first to match sets the maintenance status)
    - if a maintenance is active, the resource can no longer be used by normal users (block usage sessions)
    - active usage sessions are NOT terminated if during them a maintenance condition becomes active, the maintenance starts afterwards
    - users who are maintainers of the resource can still start and stop the machine during maintenance
    - users who are maintainers can mark an active maintenance schedule as done
    - each maintenance which was done is tracked and a history is shown (to all users) in the ui
    - each maintenance which was done can have a note (optional) from the maintainer
[ ] Feature: Manual disabling/maintenance of a resource
    - Users with manage resource permissions as well as resource maintainers can manually set a resource to "in maintenance", they need to specify a note describing why the resource is going in maintenance
    - if the resource is in maintenance, it can only be used by users who are maintainers
    - only users with manage resource permission as well as resource maintainers can remove the maintenance status
    - this manual action is logged in the same maintenance history as the normal maintenance schedules (in the ui, does not need to be the same in the db)
[ ] Deployment: figure out how to deploy/ship using bytenode and docker images. should auto run migrations and check license