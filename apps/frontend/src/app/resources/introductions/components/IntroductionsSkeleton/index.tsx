import { Card, CardBody } from '@heroui/card';
import { Skeleton } from '@heroui/skeleton';

export const IntroductionsSkeleton = () => {
  return (
    <Card>
      <CardBody>
        <Skeleton className="h-8 w-3/4 rounded-lg mb-4" />
        <Skeleton className="h-6 w-1/2 rounded-lg mb-4" />
        <Skeleton className="h-10 w-full rounded-lg mb-4" />
        <Skeleton className="h-6 w-1/2 rounded-lg mb-2" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </CardBody>
    </Card>
  );
};
