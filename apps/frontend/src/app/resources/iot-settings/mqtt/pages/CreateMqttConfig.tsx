import { useParams } from 'react-router-dom';
import { MqttConfigForm } from '../components/MqttConfigForm';

export function CreateMqttConfig() {
  const { resourceId } = useParams<{ resourceId: string }>();

  if (!resourceId) {
    return <div>Resource ID is required</div>;
  }

  return <MqttConfigForm resourceId={parseInt(resourceId, 10)} />;
}
