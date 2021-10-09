<?php

namespace App\Entity;

use App\Repository\GenerationByTypeRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=GenerationByTypeRepository::class)
 */
class GenerationByType
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity=PowerSystemResourceType::class)
     * @ORM\JoinColumn(nullable=false)
     */
    private $resourceType;

    /**
     * @ORM\Column(type="float")
     */
    private $quantity;

    /**
     * @ORM\Column(type="string")
     */
    private $settlementDate;

    /**
     * @ORM\Column(type="integer")
     */
    private $settlementPeriod;

    /**
     * @ORM\Column(type="datetime")
     */
    private $time;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getResourceType(): ?PowerSystemResourceType
    {
        return $this->resourceType;
    }

    public function setResourceType(?PowerSystemResourceType $resourceType): self
    {
        $this->resourceType = $resourceType;

        return $this;
    }

    public function getQuantity(): ?float
    {
        return $this->quantity;
    }

    public function setQuantity(float $quantity): self
    {
        $this->quantity = $quantity;

        return $this;
    }

    /**
     * @return mixed
     */
    public function getSettlementDate()
    {
        return $this->settlementDate;
    }

    /**
     * @param mixed $settlementDate
     */
    public function setSettlementDate($settlementDate): void
    {
        $this->settlementDate = $settlementDate;
    }

    public function getSettlementPeriod(): ?int
    {
        return $this->settlementPeriod;
    }

    public function setSettlementPeriod(int $settlementPeriod): self
    {
        $this->settlementPeriod = $settlementPeriod;

        return $this;
    }

    public function getTime(): ?\DateTimeInterface
    {
        return $this->time;
    }

    public function setTime(\DateTimeInterface $time): self
    {
        $this->time = $time;

        return $this;
    }
}
