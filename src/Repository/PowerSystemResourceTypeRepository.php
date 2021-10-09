<?php

namespace App\Repository;

use App\Entity\PowerSystemResourceType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method PowerSystemResourceType|null find($id, $lockMode = null, $lockVersion = null)
 * @method PowerSystemResourceType|null findOneBy(array $criteria, array $orderBy = null)
 * @method PowerSystemResourceType[]    findAll()
 * @method PowerSystemResourceType[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PowerSystemResourceTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PowerSystemResourceType::class);
    }

    public function getRecord(string $name): PowerSystemResourceType
    {
        $record = $this->findOneBy(['name' => $name]);

        if(is_null($record))
        {
            $record = new PowerSystemResourceType();
            $record->setName($name);
            $record->setLabel($name);
            $this->_em->persist($record);
            $this->_em->flush();
        }

        return $record;
    }

    // /**
    //  * @return PowerSystemResourceType[] Returns an array of PowerSystemResourceType objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('p.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?PowerSystemResourceType
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
