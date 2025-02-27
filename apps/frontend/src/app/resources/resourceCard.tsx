import { ReactNode } from 'react';
import { Resource } from '@attraccess/api-client';
import { filenameToUrl } from '../../api';
import {
  Card,
  CardBody,
  Link,
  Image,
  CardHeader,
  CardFooter,
  CardProps,
  Skeleton,
} from '@heroui/react';

interface ResourceCardSkeletonProps extends CardProps {
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
}

function ResourceCardSkeleton(props: ResourceCardSkeletonProps) {
  return (
    <Card {...props}>
      <CardHeader className="pb-0 pt-2 px-4 flex-row justify-between items-center">
        {props.header}
      </CardHeader>
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

function ActualResourceCard({
  resource,
  badges,
  isPressable = false,
}: ResourceCardProps & { isPressable?: boolean }) {
  return (
    <ResourceCardSkeleton
      isPressable={isPressable}
      header={
        <>
          <h4 className="font-bold text-large">{resource.name}</h4>
          {badges}
        </>
      }
      body={
        resource.imageFilename && (
          <Image
            alt={resource.name}
            className="object-cover rounded-xl"
            src={filenameToUrl(resource.imageFilename)}
            width={270}
          />
        )
      }
    />
  );
}

interface ResourceCardProps extends Omit<CardProps, 'resource'> {
  resource: Resource;
  badges?: ReactNode;
}

export function ResourceCard(props: ResourceCardProps & { href?: string }) {
  if (props.href) {
    return (
      <Link href={props.href}>
        <ActualResourceCard {...props} isPressable />
      </Link>
    );
  }

  return <ActualResourceCard {...props} />;
}
