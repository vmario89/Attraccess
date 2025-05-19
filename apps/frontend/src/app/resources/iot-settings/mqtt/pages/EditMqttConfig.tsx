import { useParams } from 'react-router-dom';
import { MqttConfigForm } from '../components/MqttConfigForm';

export function EditMqttConfig() {
  const { resourceId, configId } = useParams<{ resourceId: string; configId: string }>();

  if (!resourceId || !configId) {
    return <div>Resource ID and Configuration ID are required</div>;
  }

  return <MqttConfigForm resourceId={parseInt(resourceId, 10)} configId={parseInt(configId, 10)} isEdit={true} />;
}
