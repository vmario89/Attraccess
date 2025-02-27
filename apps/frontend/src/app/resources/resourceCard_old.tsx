import { ReactNode } from 'react';
import { Resource } from '@attraccess/api-client';
import { filenameToUrl } from '../../api';
import { Card, CardBody, Link, Image } from '@heroui/react';

interface ResourceCardProps {
  resource: Resource;
  viewMode: 'grid' | 'list';
  badges?: ReactNode;
}

function ActualCard({
  resource,
  viewMode,
  badges,
  isPressable = false,
}: ResourceCardProps & { isPressable?: boolean }) {
  return (
    <Card isPressable={isPressable}>
      <CardBody
        className={`p-0 overflow-hidden ${viewMode === 'grid' ? '' : 'flex'}`}
      >
        <div
          className={`${
            viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'
          } relative`}
        >
          {resource.imageFilename && (
            <Image
              src={filenameToUrl(resource.imageFilename)}
              alt={resource.name}
              className={`${
                viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'
              } p-2 object-contain`}
              radius="none"
            />
          )}
          <div className="absolute top-2 right-2 z-10">{badges}</div>
        </div>
        <div className="p-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
            {resource.name}
          </h3>
          {resource.description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {resource.description}
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function ResourceCard(props: ResourceCardProps & { href?: string }) {
  if (props.href) {
    return (
      <Link href={props.href}>
        <ActualCard {...props} isPressable />
      </Link>
    );
  }

  return <ActualCard {...props} />;
}
