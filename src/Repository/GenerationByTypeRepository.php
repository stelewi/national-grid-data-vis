<?php

namespace App\Repository;

use App\Entity\GenerationByType;
use App\Entity\PowerSystemResourceType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method GenerationByType|null find($id, $lockMode = null, $lockVersion = null)
 * @method GenerationByType|null findOneBy(array $criteria, array $orderBy = null)
 * @method GenerationByType[]    findAll()
 * @method GenerationByType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class GenerationByTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, GenerationByType::class);
    }

    public function getRecord(
        string $settlementDate,
        int $settlementPeriod,
        PowerSystemResourceType $resourceType): GenerationByType
    {
        $record = $this->findOneBy([
            'settlementDate' => $settlementDate,
            'settlementPeriod' => $settlementPeriod,
            'resourceType' => $resourceType
        ]);

        if(is_null($record))
        {
            $record = new GenerationByType();
            $record->setSettlementDate($settlementDate);
            $record->setSettlementPeriod($settlementPeriod);
            $record->setResourceType($resourceType);
            $record->setTime($this->toTime($settlementDate, $settlementPeriod));

            $this->_em->persist($record);
        }

        return $record;
    }

    private function toTime(string $settlementDate, int $settlementPeriod): \DateTimeImmutable
    {
        $hour = (int) floor($settlementPeriod / 2);
        $minutes = ($settlementPeriod % 2) * 30;

        $time = \DateTimeImmutable::createFromFormat('Y-m-d', $settlementDate);
        $time = $time->setTime($hour, $minutes);

        return $time;
    }

     /**
      * @return GenerationByType[] Returns an array of GenerationByType objects
      */
    public function query(
        \DateTimeInterface $startTime,
        \DateTimeInterface $endTime
    ) {
        return $this->createQueryBuilder('g')
            ->andWhere('g.time >= :startTime')
            ->andWhere('g.time <= :endTime')
            ->setParameter('startTime', $startTime)
            ->setParameter('endTime', $endTime)
            ->orderBy('g.time', 'ASC')
            ->getQuery()
            ->getResult()
        ;
    }

    /*
    public function findOneBySomeField($value): ?GenerationByType
    {
        return $this->createQueryBuilder('g')
            ->andWhere('g.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
