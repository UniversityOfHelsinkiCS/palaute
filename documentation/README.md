# Documentation

This is the index page for Norppa docs.

## Topics

- [Entity schema](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/entity_diagram.md)
- [Access rights (Oikeusryhmät, in Finnish)](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/oikeusryhmat.md)
- [Norppa terminology](https://github.com/UniversityOfHelsinkiCS/palaute/blob/master/documentation/terminology.md)
- [Cronjobs](cronjobs.md)
- [Configuration](configuration.md)
- [Translations](translations.md)

## Service architecture

The Norppa core in this repo consists of a NodeJS server and a React frontend, but the entire Norppa system is built of many more services.

```mermaid
graph TB
    subgraph Norppa
        subgraph Norppa core
            direction TB
            client[React app] --> server[NodeJS server]
        end

        server -->|Read, write| pg[(Postgres)]
        updater[Updater] -->|Write| pg
    end

    subgraph Common Toska services
        jami[JAMI]
        pate[Pate]
        importer[Importer]
    end

    updater -->|Fetch data| importer
    importer -->|Fetch data| sisu[Sisu export APIs]
    server -->|Get IAM access| jami
    server -->|Send mail| pate


    subgraph Analytics
        direction TB
        sentry[Sentry]
        graylog[Graylog]
        grafana[Grafana]
    end

```

## Documentation guidelines

- Document whatever cannot be documented in code or needs visibility for a broader audience.
- The biggest and only crime is to not delete or update outdated documentation when you notice it. No need to ask for permission to do so.
