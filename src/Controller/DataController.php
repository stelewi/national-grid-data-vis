<?php

namespace App\Controller;

use App\Repository\GenerationByTypeRepository;
use App\Repository\PowerSystemResourceTypeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class DataController extends AbstractController
{
    private GenerationByTypeRepository $genByTypeRepo;
    private PowerSystemResourceTypeRepository $powerSystemResourceTypeRepo;
    private SerializerInterface $serializer;

    /**
     * DataController constructor.
     * @param GenerationByTypeRepository $genByTypeRepo
     * @param PowerSystemResourceTypeRepository $powerSystemResourceTypeRepo
     * @param SerializerInterface $serializer
     */
    public function __construct(GenerationByTypeRepository $genByTypeRepo, PowerSystemResourceTypeRepository $powerSystemResourceTypeRepo, SerializerInterface $serializer)
    {
        $this->genByTypeRepo = $genByTypeRepo;
        $this->powerSystemResourceTypeRepo = $powerSystemResourceTypeRepo;
        $this->serializer = $serializer;
    }


    /**
     * @Route("/data/types", name="data")
     */
    public function types(): Response
    {
        $types = $this->powerSystemResourceTypeRepo->findBy(
            [],
            ['name' => 'ASC']
        );

        return new JsonResponse(
            $this->serializer->serialize($types, 'json'),
            Response::HTTP_OK,
            [],
            true
        );
    }
}
