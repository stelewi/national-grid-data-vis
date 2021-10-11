<?php

namespace App\Controller;

use App\Repository\GenerationByTypeRepository;
use App\Repository\PowerSystemResourceTypeRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
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
     * @Route("/data/types", name="data_types")
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

    private function parseQueryDateString(?string $date, string $default): \DateTimeImmutable
    {
        if($date !== null)
        {
            return \DateTimeImmutable::createFromFormat('Y-m-d', $date);
        }
        else {
            return new \DateTimeImmutable($default);
        }
    }

    /**
     * @Route("/data/gen-by-type", name="data_gen_by_type")
     */
    public function genByType(Request $request): Response
    {

        $from = new \DateTimeImmutable($request->query->get('from'));
        $to = new \DateTimeImmutable($request->query->get('to'));
        // @todo - add resolution to data
        $resolution = 'PT30M';

        dump($from);
        dump($to);

        $data = $this->genByTypeRepo->query($from, $to);

        return new JsonResponse(
            $this->serializer->serialize($data, 'json'),
            Response::HTTP_OK,
            [],
            true
        );
    }
}
