import { ReactNode, useState } from 'react';
import { filenameToUrl } from '../../api';
import { Card, CardBody, Image, CardHeader, CardFooter, CardProps, Skeleton, Link } from '@heroui/react';
import { Resource } from '@attraccess/react-query-client';
import { ResourceEditModal } from './resourceEditModal';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { MoreVertical } from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';

interface ResourceCardSkeletonProps extends CardProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}

function ResourceCardSkeleton(props: ResourceCardSkeletonProps) {
  return (
    <Card {...props}>
      <CardHeader className="pb-0 pt-2 px-4 flex-row justify-between items-center">{props.header}</CardHeader>
      <CardBody className="overflow-visible py-2">{props.body}</CardBody>
      <CardFooter>{props.footer}</CardFooter>
    </Card>
  );
}

export function ResourceCardSkeletonLoader() {
  return (
    <ResourceCardSkeleton
      isPressable={false}
      header={<Skeleton className="h-10 w-24" />}
      body={<Skeleton className="h-40 w-full" />}
      footer={<Skeleton className="h-10 w-24" />}
    />
  );
}

function ActualResourceCard(props: ResourceCardProps & { isPressable?: boolean }) {
  const { resource, badges, isPressable = false, ...rest } = props;
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    // Optionally, add a toast notification here if not handled by modal
    // queryClient.invalidateQueries(...) is handled within the modal
  };
  return (
    <>
      <ResourceCardSkeleton
        isPressable={isPressable && !isEditModalOpen} // Prevent card press when modal might open
        header={
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col">
              <h4 className="font-bold text-large">{resource.name}</h4>
              {badges}
            </div>
            {/* TODO: Add admin/permission check here */}
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Resource Actions">
                <DropdownItem
                  key="edit"
                  startContent={<PencilSquareIcon className="w-5 h-5" />}
                  onPress={() => setIsEditModalOpen(true)}
                >
                  Edit Resource
                </DropdownItem>
                {/* Add other actions like "Delete" here if needed */}
              </DropdownMenu>
            </Dropdown>
          </div>
        }
        body={
          resource.imageFilename && (
            <div className="flex justify-center w-full">
              <Image
                alt={resource.name}
                className="object-cover rounded-xl"
                src={filenameToUrl(resource.imageFilename)}
                style={{ maxHeight: '200px' }}
              />
            </div>
          )
        }
        {...rest}
      />
      {isEditModalOpen && (
        <ResourceEditModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          resource={resource}
          onUpdated={handleEditSuccess}
        />
      )}
    </>
  );
}

interface ResourceCardProps extends Omit<CardProps, 'resource'> {
  resource: Resource;
  badges?: ReactNode;
}

export function ResourceCard(props: ResourceCardProps & { href?: string }) {
  return (
    <ActualResourceCard {...props} isPressable={!!props.href || props.isPressable} as={props.href ? Link : undefined} />
  );
}
