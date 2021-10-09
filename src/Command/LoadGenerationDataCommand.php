<?php

namespace App\Command;

use App\Repository\GenerationByTypeRepository;
use App\Repository\PowerSystemResourceTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use League\Csv\Reader;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class LoadGenerationDataCommand extends Command
{
    private const URL = 'https://api.bmreports.com/BMRS/B1620/V1';

    protected static $defaultName = 'app:load-generation-data';
    protected static $defaultDescription = 'Load power generation data for a date...';

    private EntityManagerInterface $em;
    private HttpClientInterface $httpClient;
    private PowerSystemResourceTypeRepository $typeRepo;
    private GenerationByTypeRepository $genByTypeRepo;
    private string $bmrsApiKey;

    /**
     * LoadGenerationDataCommand constructor.
     * @param EntityManagerInterface $em
     * @param HttpClientInterface $httpClient
     * @param PowerSystemResourceTypeRepository $typeRepo
     * @param GenerationByTypeRepository $genByTypeRepo
     * @param string $bmrsApiKey
     */
    public function __construct(EntityManagerInterface $em, HttpClientInterface $httpClient, PowerSystemResourceTypeRepository $typeRepo, GenerationByTypeRepository $genByTypeRepo, string $bmrsApiKey)
    {
        parent::__construct();
        $this->em = $em;
        $this->httpClient = $httpClient;
        $this->typeRepo = $typeRepo;
        $this->genByTypeRepo = $genByTypeRepo;
        $this->bmrsApiKey = $bmrsApiKey;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('date', InputArgument::OPTIONAL, 'yyyy-mm-dd')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $date = $input->getArgument('date');

        if(is_null($date))
        {
            $date = (new \DateTime())->format('Y-m-d');
        }

        for($period = 1; $period <= 50; $period++)
        {
            $csv = $this->fetchCsv($io, $date, $period);

            if(is_null($csv))
            {
                continue;
            }

            $this->loadDataFromCsv($csv);
        }

        $io->success('Power generation data loaded for: ' . $date);

        return Command::SUCCESS;
    }

    private function fetchCsv(SymfonyStyle $io, string $date, int $period): ?Reader
    {
        $io->writeln("Loading data for $date, period $period...");
        $response = $this->httpClient->request('GET', self::URL, [
            'query' => [
                'APIKey' => $this->bmrsApiKey,
                'ServiceType' => 'CSV',
                'Period' => (string) $period,
                'SettlementDate' => $date
            ]
        ]);

        // dont bother checking response code as BMRS give us a 200 when no data exists
        // check to see if we got a CSV back instead...
        if (!preg_match('/csv/', $response->getHeaders()['content-type'][0]))
        {
           $io->warning("No CSV in response, skipping..");
           return null;
        }

        $io->success("Data pulled successfully!");

        // dump($response->getContent());
        $csv = Reader::createFromString($response->getContent());
        $csv->setHeaderOffset(4);

        return $csv;
    }

    private function loadDataFromCsv(Reader $csv)
    {
        foreach ($csv as $row)
        {
            // skip non-data rows
            if(is_null($row['Quantity']))
            {
                continue;
            }

            $resourceTypeName = $row['Power System Resource  Type'];
            $settlementPeriod = (int) $row['Settlement Period'];
            $settlementDate = $row['Settlement Date'];
            $quantity = (float) $row['Quantity'];

            $type = $this->typeRepo->getRecord($resourceTypeName);
            $genByType = $this->genByTypeRepo->getRecord(
                $settlementDate,
                $settlementPeriod,
                $type
            );

            $genByType->setQuantity($quantity);
        }

        $this->em->flush();
    }
}
