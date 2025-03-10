# Attraccess Documentation

## MQTT Integration

The MQTT integration feature allows Attraccess to publish messages to MQTT servers when resources are used or released, enabling integration with IoT devices and external systems.

### Documentation Files

- [MQTT Integration Overview](./mqtt-integration.md) - Comprehensive documentation of the MQTT integration feature
- [MQTT Broker Setup Guide](./mqtt-setup-guide.md) - Detailed guide for setting up and configuring an MQTT broker
- [MQTT Integration Examples](./mqtt-examples.md) - Practical examples and templates for common MQTT integration scenarios

### Key Features

1. **Resource-Specific MQTT Configuration** - Each resource can have its own MQTT configuration, including server, topics, and message templates
2. **Handlebars Templating** - Use Handlebars templates for dynamic topics and messages
3. **Multiple Server Support** - Configure and use multiple MQTT servers
4. **Secure Connections** - Support for TLS/SSL, username/password authentication

### Quick Start

1. Set up an MQTT broker using the [MQTT Broker Setup Guide](./mqtt-setup-guide.md)
2. Configure an MQTT server in Attraccess
3. Add MQTT configuration to resources
4. Test the integration using the examples in [MQTT Integration Examples](./mqtt-examples.md)

### API Endpoints

The MQTT integration adds the following API endpoints:

#### MQTT Servers

- `GET /mqtt/servers` - Get all MQTT servers
- `GET /mqtt/servers/:id` - Get MQTT server by ID
- `POST /mqtt/servers` - Create new MQTT server
- `PUT /mqtt/servers/:id` - Update MQTT server
- `DELETE /mqtt/servers/:id` - Delete MQTT server
- `POST /mqtt/servers/:id/test` - Test MQTT server connection

#### Resource MQTT Configuration

- `GET /resources/:resourceId/mqtt/config` - Get MQTT config for a resource
- `POST /resources/:resourceId/mqtt/config` - Create or update MQTT config
- `DELETE /resources/:resourceId/mqtt/config` - Delete MQTT config
- `POST /resources/:resourceId/mqtt/config/test` - Test MQTT config

### Frontend Features

The MQTT integration includes:

1. MQTT server management UI
2. Resource MQTT configuration UI
3. Handlebars template variable documentation and help text
4. WYSIWYG preview for templates

### For Developers

If you're extending the MQTT integration, refer to the unit tests in:

- `apps/api/src/mqtt/mqtt-client.service.spec.ts`
- `apps/api/src/resources/mqtt/publisher/mqtt-publisher.service.spec.ts`
- `apps/api/src/resources/mqtt/templates/templates.spec.ts`
