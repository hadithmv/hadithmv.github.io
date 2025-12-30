**Name:** Mohamed Ashraaf Ibrahim

**Student ID:** S2402243

**UWE ID:** 25024336

**Course:** MSc In Information Technology - May 2025

**Module:** Big Data

**College:** Villa College

**Lecturer:** Margret Vijay

**Date:** 27/12/2025

**Word Count:** 2479

# Abstract

This report provides a focused evaluation of database architecture
options for ABC Consulting's strategic initiative to integrate big data
and predictive analytics into its commercial poultry production
operations. The poultry farming sector is increasingly leveraging data
from IoT sensors and operational systems to enhance efficiency,
sustainability, and animal welfare. The critical decision between
traditional SQL (Relational) and modern NoSQL (Non-relational) databases
will fundamentally shape the company's ability to achieve its objectives
of real-time environmental monitoring, reduction of feed waste, and
generation of predictive health insights. This paper evaluates these
architectural choices against key operational and technical criteria. By
conducting a balanced, scenario-specific evaluation, this report
provides a strategic framework to guide ABC Consulting in selecting a
scalable, robust, and future-proof data infrastructure fit for a leader
in data-enabled agriculture.

**Table of Contents**

[Abstract [2](#abstract)](#abstract)

[List of Tables [4](#list-of-tables)](#list-of-tables)

[List of Figures [5](#list-of-figures)](#list-of-figures)

[List of Abbreviations
[6](#list-of-abbreviations)](#list-of-abbreviations)

[Introduction [7](#introduction)](#introduction)

[1. Dataset Types and Data Characteristics
[9](#dataset-types-and-data-characteristics)](#dataset-types-and-data-characteristics)

[2. Data Processing and Storage Requirements
[11](#data-processing-and-storage-requirements)](#data-processing-and-storage-requirements)

[3. Organisation Readiness and Affordability
[13](#organisation-readiness-and-affordability)](#organisation-readiness-and-affordability)

[4. Data Quality Requirements
[15](#data-quality-requirements)](#data-quality-requirements)

[5. Knowledge Retrieval, Analytics, and Decision Support
[17](#knowledge-retrieval-analytics-and-decision-support)](#knowledge-retrieval-analytics-and-decision-support)

[6. Data Privacy and Security Issues
[19](#data-privacy-and-security-issues)](#data-privacy-and-security-issues)

[7. Synthesis and Recommendations
[20](#synthesis-and-recommendations)](#synthesis-and-recommendations)

[Conclusion [23](#conclusion)](#conclusion)

[References [24](#references)](#references)

# List of Tables

[Table 1: Poultry Production Data Matrix and Database Suitability
[10](#_Toc217761449)](#_Toc217761449)

[Table 2: Data Processing Requirements Comparison
[11](#_Toc217761450)](#_Toc217761450)

[Table 3: Scalability Comparison - Vertical vs. Horizontal
[12](#_Toc217761451)](#_Toc217761451)

[Table 4: Organisational Readiness Factors
[13](#_Toc217761452)](#_Toc217761452)

[Table 5: Consequences of Low-Quality Data in Poultry Operations
[16](#_Toc217761453)](#_Toc217761453)

[Table 6: Poultry Production Domain Ontology with Entity Relationships
[17](#_Toc217761454)](#_Toc217761454)

[Table 7: Database Security Features Comparison
[19](#_Toc217761455)](#_Toc217761455)

[Table 8: Recommended Architecture Components
[21](#_Toc217761456)](#_Toc217761456)

[Table 9: Summary Decision Matrix for Database Architecture
[21](#_Toc217761457)](#_Toc217761457)

# List of Figures

[Figure 1: Conceptual Framework for Database Architecture Decision
[8](#_Toc217761458)](#_Toc217761458)

[Figure 2: Data Quality and Processing Pipeline
[16](#_Toc217761459)](#_Toc217761459)

[Figure 3: Poultry Production Decision Support Dashboard (Wireframe)
[18](#_Toc217761460)](#_Toc217761460)

[Figure 4: Recommended Hybrid Data Architecture for ABC Consulting
[20](#_Toc217761461)](#_Toc217761461)

# List of Abbreviations

  ---------------------- ------------------------------------------------
  AI                     Artificial Intelligence

  ACID                   Atomicity, Consistency, Isolation, Durability

  BASE                   Basically Available, Soft state, Eventually
                         consistent

  BI                     Business Intelligence

  CAP                    Consistency, Availability, Partition tolerance

  DSS                    Decision Support System

  ERP                    Enterprise Resource Planning

  ETL                    Extract, Transform, Load

  GDPR                   General Data Protection Regulation

  HPAI                   Highly Pathogenic Avian Influenza

  IoT                    Internet of Things

  KPI                    Key Performance Indicator

  LDAP                   Lightweight Directory Access Protocol

  MFA                    Multi-Factor Authentication

  ML                     Machine Learning

  NoSQL                  Not Only SQL

  RDBMS                  Relational Database Management System

  SQL                    Structured Query Language

  TCO                    Total Cost of Ownership

  TDE                    Transparent Data Encryption
  ---------------------- ------------------------------------------------

# Introduction

The agricultural sector is undergoing a profound digital transformation,
with data emerging as a critical asset for optimising operations and
ensuring sustainability. For the poultry industry, this evolution
presents a significant opportunity to move beyond traditional farming
practices towards precision agriculture. ABC Consulting's ambition to
lead this change by applying data-enabled innovations to commercial
broiler production is both timely and strategic. The objectives---to
develop infrastructure for real-time data capture, generate predictive
insights, reduce feed waste, and improve chicken survivability---are
central to building a competitive and resilient business (Franzo *et
al*., 2023).

Central to this data-driven enterprise is the choice of a foundational
data processing infrastructure. The choice between a traditional SQL
database, a modern NoSQL database, or a hybrid model is a foundational
decision impacting long-term scalability, flexibility, and analytical
capability. This is not merely a technical choice but a strategic one
that will determine the company's ability to harness its data assets.
Given this is ABC Consulting's first venture into big data, a careful
evaluation is essential to mitigate risks and ensure the selected
architecture is fit for purpose.

To address this challenge, this report provides a balanced evaluation of
these database architectures against the unique requirements of the
poultry production industry. The analysis is structured around the six
core evaluation criteria conceptualised in Figure 1, providing a
comprehensive framework for this critical decision.

![[]{#_Toc217761458 .anchor}Figure 1: Conceptual Framework for Database
Architecture Decision](media/image1.png){width="5.444444444444445in"
height="4.861111111111111in"}

# 1. Dataset Types and Data Characteristics

A modern poultry farm is a prolific generator of diverse data,
showcasing the primary characteristics of big data: volume, velocity,
variety and veracity (Leishman *et al*., 2023). The veracity dimension
is critical in this context, as sensor data from harsh farm environments
may be prone to inaccuracies that must be addressed through data quality
processes. Understanding these characteristics is the first step in
designing an effective data architecture.

ABC Consulting's data landscape will include highly structured data,
such as financial records from an ERP system, feed inventory, mortality
counts, processing yields, and employee data. These datasets are
characterised by stable formats and are critical for core business
operations and reporting. SQL databases, with their relational model and
strict schema enforcement adhering to ACID (Atomicity, Consistency,
Isolation, Durability) properties, are exceptionally well-suited for
this data, ensuring transactional integrity (Marmelstein *et al*.,
2024). In contrast, many NoSQL databases operate on a principle of BASE
(Basically Available, Soft state, Eventually consistent), prioritising
availability over strict consistency, which is better suited for
high-volume, less structured data streams.

Conversely, the primary driver of ABC's big data initiative will be the
high-velocity, heterogeneous data from Internet of Things (IoT) sensors
and monitoring systems. This includes semi-structured environmental data
(temperature, humidity, ammonia levels), often generated in formats like
JSON every few seconds (Bumanis *et al*., 2022). Furthermore,
unstructured data such as audio files for monitoring flock vocalisations
(an indicator of stress or disease) and high-volume video feeds for
tracking bird behaviour are becoming vital for animal welfare and
productivity analysis (Poudel *et al*., 2025). A traditional SQL
database would struggle to manage this heterogeneity efficiently,
requiring the forcing of flexible sensor data into rigid tabular
structures or storing large files as binary objects, which makes
querying difficult. In contrast, NoSQL databases are designed for this
variety---document databases can store JSON-like sensor logs natively,
while object stores are ideal for large unstructured files.

  --------------------------------------------------------------------------------------------------------------
  **Data Source** **Data Type**  **Structure**     **Velocity**   **SQL           **NoSQL         **Primary Use
                                                                  Suitability**   Suitability**   Case**
  --------------- -------------- ----------------- -------------- --------------- --------------- --------------
  Financial       Sales,         Structured        Low            High            Low             Financial
  System          Expenses                                                                        Reporting

  Environmental   Temp,          Semi-Structured   High           Low             High            Real-time
  Sensors         Humidity, NH₃                    (Real-time)                                    Alerts,
                                                                                                  Anomaly
                                                                                                  Detection

  Feed Management Consumption,   Structured        Medium         High            Medium          Inventory
                  Inventory                                                                       Optimisation

  Video/Audio     CCTV, Acoustic Unstructured      High           Low             High            Behaviour
  Monitoring      Recordings                       (Streaming)                                    Analysis,
                                                                                                  Disease
                                                                                                  Prediction

  Processing      Yield, Quality Structured        Medium         High            Low             Supply Chain
  Plant           Grades                                                                          Management

  Health Records  Veterinary     Semi-Structured   Low-Medium     High            Medium          Health &
                  Logs,                                                                           Compliance
                  Medication                                                                      Tracking
  --------------------------------------------------------------------------------------------------------------

  : []{#_Toc217761449 .anchor}Table 1: Poultry Production Data Matrix
  and Database Suitability

Key: High = Optimal fit; Medium = Workable; Low = Poor fit with
significant limitations.

# 2. Data Processing and Storage Requirements

ABC Consulting's objectives require both real-time responsiveness for
immediate operational decisions and deep historical analysis for
strategic planning. These dual needs place distinct demands on the data
infrastructure. Real-time sensor ingestion is crucial for generating
immediate alerts for issues like a sudden temperature drop or a rise in
ammonia levels, which can prevent mass mortality events. This requires a
database capable of handling high-speed data writes, a strength of many
NoSQL systems.

This trade-off between consistency and availability is formalised in the
context of the CAP theorem, which posits that a distributed system can
only guarantee two of three properties---Consistency, Availability, and
Partition tolerance---traditional SQL databases typically prioritise
Consistency, ensuring all users see the same data, and may sacrifice
Availability during a network partition (Kumar, 2023). Conversely, many
NoSQL databases are architected to prioritise Availability over
immediate Consistency, accepting 'eventual consistency' to ensure the
system remains operational for data ingestion even if some nodes are
temporarily out of sync. For ABC Consulting, this means choosing between
immediate data accuracy (SQL) for critical financial transactions versus
high availability (NoSQL) for continuous sensor data ingestion where
brief inconsistencies are acceptable.

  -------------------------------------------------------------------------
  **Processing       **SQL             **NoSQL Capability** **Recommended
  Requirement**      Capability**                           For**
  ------------------ ----------------- -------------------- ---------------
  Real-time Sensor   Low - Write       High - Horizontal    NoSQL
  Ingestion          bottlenecks at    scaling              
                     scale                                  

  Transactional      High - ACID       Low - Eventual       SQL
  Processing         compliance        consistency          

  Batch Historical   High - Complex    Medium - Requires    SQL
  Analysis           JOINs             additional           
                                       frameworks           

  Predictive Model   Medium - Scale    High - Distributed   NoSQL
  Training           limitations       processing           

  Ad-hoc Business    High - SQL is the Low - Less mature    SQL
  Queries            standard          query languages      

  Large File         Low - BLOB        High - Object stores NoSQL
  (Video/Audio)      storage           designed for this    
  Storage            inefficient                            
  -------------------------------------------------------------------------

  : []{#_Toc217761450 .anchor}Table 2: Data Processing Requirements
  Comparison

Beyond immediate processing needs, the long-term viability of the chosen
architecture depends on its ability to scale. As ABC Consulting deploys
more sensors and retains data from more production cycles, data volume
will grow exponentially. This makes the underlying architecture's
scalability a key consideration for future-proofing the investment

For a growing business like ABC Consulting, the exponential cost curve
of vertically scaling a single powerful SQL server could become a
significant financial burden. In contrast, the linear cost model of
horizontally scaling a NoSQL cluster by adding more commodity servers
offers a more predictable and potentially lower Total Cost of Ownership
(TCO) at scale.

  ------------------------------------------------------------------------
  Scaling         SQL (Traditional RDBMS)       NoSQL (Distributed)
  Approach                                      
  --------------- ----------------------------- --------------------------
  Method          Vertical (Scale-up)           Horizontal (Scale-out)

  Hardware        More powerful, expensive      Commodity hardware
                  servers                       clusters

  Cost Curve      Exponential at large scale    Linear with data growth
  ------------------------------------------------------------------------

  : []{#_Toc217761451 .anchor}Table 3: Scalability Comparison - Vertical
  vs. Horizontal

# 3. Organisation Readiness and Affordability

As a first-time adopter of a large-scale data platform, ABC Consulting
must realistically assess its internal capabilities and the TCO. Beyond
technical skills, organisational readiness involves fostering a
data-centric culture. Stakeholders, from farm managers to veterinarians,
may be reluctant to share data or adopt new digital tools due to
concerns about complexity or a lack of perceived benefit (Chapot *et
al*., 2024). A successful implementation will require not just hiring
technical staff but also investing in training and change management to
demonstrate the value of these new data-driven insights.

The mature talent pool for SQL makes recruitment straightforward. In
contrast, expertise in specific NoSQL technologies can be scarcer and
more expensive. While many NoSQL databases are open-source, their
operational complexity can be higher than traditional SQL systems. This
translates to higher costs for specialized staff or for cloud-based
managed services.

  ---------------------------------------------------------------------------
  **Factor**      **SQL            **NoSQL Databases**   **Impact for ABC
                  Databases**                            Consulting**
  --------------- ---------------- --------------------- --------------------
  Talent          High - Mature    Medium - Specialist   SQL expertise is
  Availability    market           skills less common    easier to recruit
                                                         and retain.

  Training Effort Low - Widely     Medium-High -         Lower initial
                  taught in IT     Technology-specific   training investment
                  curricula        training needed       required for SQL.

  Community &     Extensive -      Growing - Varies by   SQL offers more
  Documentation   Decades of       technology            established
                  resources                              troubleshooting
                                                         resources.

  Vendor Support  Strong -         Variable - Some       Support SLAs are
                  Commercial &     technologies lack     critical for
                  open-source      enterprise support    mission-critical
                  options                                systems.
  ---------------------------------------------------------------------------

  : []{#_Toc217761452 .anchor}Table 4: Organisational Readiness Factors

ABC must weigh the lower initial cost of leveraging existing SQL
expertise against the long-term scalability and flexibility benefits of
a managed NoSQL service. Data analytics can drive significant cost
optimisation in inventory management and logistics, reducing waste and
improving supply chain efficiency, which helps build a clear business
case for this investment (Kler *et al*., 2022).

# 4. Data Quality Requirements

The accuracy of ABC Consulting's predictive models and operational
alerts will depend entirely on the quality of the underlying data.
Inaccurate data can lead to flawed business decisions, such as incorrect
feed formulations or a failure to detect disease outbreaks, with severe
financial consequences (Alders and Tomley, 2022). For instance, in
bio-mapping studies tracking Salmonella in poultry processing,
inconsistent data collection can render food safety decisions unreliable
(Vargas *et al*., 2023).

SQL databases enforce data quality at the point of entry through a rigid
schema and strict integrity constraints (ACID compliance). This is
essential for transactional systems. However, this rigidity can lead to
data loss if incoming sensor data deviates from the predefined format.
In contrast, NoSQL databases often employ a flexible 'schema-on-read'
approach, ingesting data in its native format without immediate
validation. While this provides resilience against variations in sensor
data, it crucially shifts the burden of data cleansing, validation, and
quality enforcement to the analytics pipeline downstream (Bumanis,
2024).

A robust data quality strategy is essential regardless of the database
choice. This involves implementing Extract, Transform, and Load (ETL)
processes that clean, validate, and standardize data before it is used
for critical analytics. For ABC, this means extracting data from
sensors, transforming it into a consistent format (e.g., standardizing
temperature to Celsius), and loading it into the appropriate database.
Such processes are crucial, as even sample preparation methods can
significantly impact analytical results (Gogé *et al*., 2021).

![[]{#_Toc217761459 .anchor}Figure 2: Data Quality and Processing
Pipeline](media/image2.png){width="5.435416666666667in"
height="2.7222222222222223in"}

As illustrated in Figure 2, data from IoT sensors, video/audio systems,
and ERP platforms flows into an ETL and Data Quality Engine. Validated
data proceeds to Analytical Stores (Data Warehouse/Lake), while records
that fail validation are sent to a Data Quarantine for review.

  ------------------------------------------------------------------------
  **Data Quality  **Operational        **Financial      **Strategic
  Issue**         Impact**             Impact**         Impact**
  --------------- -------------------- ---------------- ------------------
  Inaccurate      False alarms or      Increased flock  Loss of trust in
  Sensor Readings missed events (e.g., mortality,       data-driven
                  ventilation failure) wasted energy    decision-making

  Incomplete      Unreliable disease   Increased        Regulatory
  Health Records  detection models     veterinary       compliance risks,
                                       costs, reduced   brand damage
                                       yield            

  Delayed         Slow response to     High mortality   Reputational
  Environmental   critical issues like rates from heat  damage among
  Data            heat stress          stress           customers

  Inconsistent    Incorrect feed       Increased feed   Inability to
  Feed Data       formulation and      costs, poor      optimise for feed
                  distribution         growth rates     conversion ratio
  ------------------------------------------------------------------------

  : []{#_Toc217761453 .anchor}Table 5: Consequences of Low-Quality Data
  in Poultry Operations

# 5. Knowledge Retrieval, Analytics, and Decision Support

The ultimate goal of ABC's data infrastructure is to generate actionable
knowledge to support better decision-making. SQL is the native language
of data analysis, making it ideal for business intelligence (BI)
dashboards reporting on key performance indicators (KPIs) like feed
conversion ratios and production costs. For the retrospective analysis
ABC requires, a SQL-based data warehouse is highly effective.

Beyond traditional querying, ABC Consulting should consider knowledge
modelling to enhance information retrieval. An ontology would formally
define the entities, such as 'broiler flock', 'feed batch', 'ventilation
system', and the relationships between them. For example, it could be
codified that 'elevated ammonia reading' indicates 'ventilation
failure', which causes 'respiratory stress'. This structured knowledge
allows for more intelligent, context-aware queries and root-cause
analysis. Graph databases, a category of NoSQL, are well-suited for
storing and querying such interconnected knowledge structures, enabling
ABC to move from raw data to actionable domain knowledge.

  -------------------------------------------------------------------------------
  **Entity        **Relationship**   **Related       **Information Retrieval
  (Class)**                          Entity**        Query**
  --------------- ------------------ --------------- ----------------------------
  Flock           is housed in       Barn            Retrieve all flocks in Barn
                                                     A with mortality \> 2%

  Flock           consumes           Feed Batch      Which feed batches were
                                                     consumed by flocks with poor
                                                     growth rates?

  Flock           has recorded       Health Event    List all flocks that
                                                     experienced respiratory
                                                     illness in Q3

  Barn            contains           Environmental   Show all sensors in barns
                                     Sensor          exceeding ammonia thresholds

  Environmental   monitors           Environmental   Which sensors detected
  Sensor                             Condition       temperature anomalies last
                                                     week?

  Environmental   generates          Sensor Reading  Retrieve hourly humidity
  Sensor                                             readings for Barn B

  Sensor Reading  indicates          Alert Condition Find all readings that
                                                     triggered heat stress alerts
  -------------------------------------------------------------------------------

  : []{#_Toc217761454 .anchor}Table 6: Poultry Production Domain
  Ontology with Entity Relationships

Figure 3 presents a wireframe for a potential dashboard for ABC's farm
managers, integrating data from multiple sources to provide a holistic
view. The KPIs on production costs would be powered by queries on a SQL
data warehouse, while the 'Real-time Environmental Status' and
'Predictive Alerts' would be fed by a fast, scalable NoSQL database
processing live sensor data.

![[]{#_Toc217761460 .anchor}Figure 3: Poultry Production Decision
Support Dashboard
(Wireframe)](media/image3.png){width="5.433333333333334in"
height="3.5833333333333335in"}

Machine Learning (ML) models, such as those predicting disease outbreaks
based on live data patterns (Yoon *et al*., 2022), often need to process
enormous volumes of diverse data. NoSQL databases are frequently
selected as the backend for ML applications due to their ability to
handle diverse data types at scale (Leishman *et al*., 2023).

# 6. Data Privacy and Security Issues

As ABC Consulting aggregates vast amounts of proprietary and sensitive
data, ensuring its privacy, security, and integrity is paramount. The
security of this data is critical; a breach could lead to operational
disruption and a loss of competitive advantage. For instance,
proprietary data on feed formulations is a valuable target for corporate
espionage.

SQL databases generally feature mature, robust security models with
granular access controls down to the row and column level. The landscape
for NoSQL is more varied, though leading databases now offer strong
enterprise-grade features. Choosing a cloud deployment offers
scalability but requires understanding the shared responsibility model,
where ABC is responsible for security in the cloud (Chapot *et al*.,
2024). Building trust with stakeholders hesitant about third-party data
storage is critical. Therefore, a strong data governance framework is
non-negotiable, ensuring compliance with regulations like GDPR and
protecting sensitive data used for HPAI risk assessment (Yoon *et al*.,
2022).

  ------------------------------------------------------------------------
  **Security          **SQL Databases**      **NoSQL Databases**
  Feature**                                  
  ------------------- ---------------------- -----------------------------
  Authentication      Strong - MFA, LDAP     Strong - Improving;
                      integration            enterprise auth

  Authorisation       Granular - Row/column  Variable -
                      level                  Document/collection level

  Encryption at Rest  Standard - Native TDE  Standard - Available in
                      support                enterprise versions

  Audit Logging       Comprehensive -        Variable - Varies by
                      Built-in trails        technology

  Compliance          Extensive - SOC 2, ISO Growing - Major vendors
  Certifications      27001                  certified
  ------------------------------------------------------------------------

  : []{#_Toc217761455 .anchor}Table 7: Database Security Features
  Comparison

# 7. Synthesis and Recommendations

After a balanced evaluation of SQL and NoSQL databases against ABC
Consulting's specific requirements, it is clear that a one-size-fits-all
approach is suboptimal. A purely SQL architecture would fail to scale
cost-effectively for live sensor data, while a purely NoSQL architecture
would lack the transactional integrity and mature query ecosystem
required for core business systems. Therefore, the most robust,
scalable, and future-proof solution is a Hybrid Model that leverages the
distinct strengths of both paradigms.

Figure 4 illustrates this proposed hybrid architecture. Data from IoT
sensors and other high-volume sources is ingested into a flexible NoSQL
data lake. Simultaneously, transactional data from ERP systems is
managed by a reliable operational SQL database. An ETL pipeline then
processes and transfers relevant data from both sources into a
structured SQL data warehouse, optimized for BI, while the data lake
directly feeds ML models.

![[]{#_Toc217761461 .anchor}Figure 4: Recommended Hybrid Data
Architecture for ABC
Consulting](media/image4.png){width="5.433333333333334in"
height="2.825in"}

  -------------------------------------------------------------------------
  Component       Purpose                   Recommended         Database
                                            Technology          Type
  --------------- ------------------------- ------------------- -----------
  Data Lake       High-volume raw sensor    MongoDB Atlas /     NoSQL
                  data ingestion            Amazon S3           

  Operational     Core business             PostgreSQL / SQL    SQL
  Database        transactions (ERP,        Server              
                  Finance)                                      

  Data Warehouse  BI and historical         PostgreSQL /        SQL
                  analysis                  Snowflake           

  Time-Series     Real-time sensor          InfluxDB /          NoSQL
  Store           monitoring & dashboards   TimescaleDB         

  ML Feature      Training data for         MongoDB / Delta     NoSQL
  Store           predictive models         Lake                
  -------------------------------------------------------------------------

  : []{#_Toc217761456 .anchor}Table 8: Recommended Architecture
  Components

This hybrid approach allows ABC Consulting to use the right tool for the
right job, ensuring performance, scalability, and integrity across all
business functions.

  ------------------------------------------------------------------------------
  **Evaluation         **SQL              **NoSQL             **Hybrid
  Criterion**          Recommendation**   Recommendation**    Advantage**
  -------------------- ------------------ ------------------- ------------------
  Dataset              Structured         Semi/unstructured   Handles the full
  Characteristics      transactional      sensor              variety of data
                                                              without
                                                              compromise.

  Processing           Complex analytical Real-time           Meets both
  Requirements         queries            high-velocity       real-time and
                                          ingestion           batch processing
                                                              needs.

  Organisation         Leverages existing Cloud-managed       Allows for gradual
  Readiness            skills             reduces complexity  capability
                                                              building and
                                                              phased adoption.

  Data Quality         Enforces integrity Flexible            A dedicated
                       at entry           ingestion +         quality pipeline
                                          downstream          bridges both
                                          validation          worlds.

  Analytics/Decision   BI and ad-hoc      ML and real-time    Enables the full
  Support              reporting          alerting            spectrum of
                                                              analytics.

  Security             Mature, granular   Improving,          A defense-in-depth
                       controls           distributed         strategy can be
                                          complexity          implemented.
  ------------------------------------------------------------------------------

  : []{#_Toc217761457 .anchor}Table 9: Summary Decision Matrix for
  Database Architecture

**\**

Implementation Recommendation: A phased approach is advised.

**Phase 1: Foundational Data Capture**.

This initial phase should focus on establishing the core infrastructure:
the NoSQL data lake for high-velocity sensor data ingestion and the
operational RDBMS for core business transactions. This allows the
organisation to build expertise with both technologies on manageable,
distinct use cases while immediately starting to capture valuable raw
data.

**Phase 2: Advanced Analytics and Insight Generation**.

Building on the foundation of Phase 1, this stage focuses on value
extraction. Key activities include constructing the SQL data warehouse
to enable business intelligence and historical analysis, and leveraging
the data lake to develop the first predictive Machine Learning (ML)
models. This ensures that the investment in advanced analytics is made
only once sufficient data has been collected and the technical team's
expertise has matured.

# Conclusion

The decision to invest in a modern data infrastructure is a pivotal
moment for ABC Consulting. This analysis has moved beyond a simple
binary choice between SQL and NoSQL, advocating instead for a nuanced,
hybrid architecture tailored to the complex demands of modern poultry
production.

By adopting the recommended model, which strategically combines the
transactional integrity of SQL with the scalable flexibility of NoSQL,
ABC Consulting can build a resilient and powerful data platform. This is
more than a technical upgrade; it is a strategic enabler. The proposed
architecture will directly empower the company to achieve its core
business objectives: enhancing animal welfare and survivability through
live monitoring, eliminating inefficiencies through precise data
analysis, and ultimately, delivering a higher quality product. This
investment will be the foundational pillar in ABC Consulting's journey
to becoming a leader in efficient, sustainable, and data-informed
agriculture, securing a decisive competitive advantage in a rapidly
evolving industry.

# References

Alders, R. and Tomley, F. (2022) Animal Board Invited Opinion Paper:
Planet, people and poultry - more and better data needed to get the
balance right, *Animal* \[online\]. 16(7), p. 100560. \[Accessed 22
December 2025\].

Bumanis, N. (2024) Overcoming Data Limitations in Precision Poultry
Farming: Processing and Data Fusion Challenges, *Procedia Computer
Science* \[online\]. 232, pp. 2302--2309. \[Accessed 20 December 2025\].

Bumanis, N., Arhipova, I., Paura, L., Vitols, G. and Jankovska, L.
(2022) Data Conceptual Model for Smart Poultry Farm Management
System, *Procedia Computer Science* \[online\]. 200, pp. 517--526.
\[Accessed 19 December 2025\].

Chapot, L., Hibbard, R., Ariyanto, K.B., Maulana, K.Y., Yusuf, H.,
Febriyani, W., Cameron, A., Paul, M., Vergne, T. and Faverjon, C. (2024)
Needs and capabilities for improving poultry production and health
management in Indonesia, *PLOS ONE* \[online\]. 19(8), p. e0308379.
\[Accessed 21 December 2025\].

Franzo, G., Legnardi, M., Faustini, G., Tucciarone, C.M. and Cecchinato,
M. (2023) When Everything Becomes Bigger: Big Data for Big Poultry
Production, *Animals* \[online\]. 13(11), p. 1804. \[Accessed 22
December 2025\].

Gogé, F., Thuriès, L., Fouad, Y., Damay, N., Davrieux, F., Moussard, G.,
Le Roux, C., Trupin-Maudemain, S., Valé, M. and Morvan, T. (2021)
Performance of near infrared spectroscopy of a solid cattle and poultry
manure database depends on the sample preparation and regression method
used, *Journal of Near Infrared Spectroscopy* \[online\]. 29(4), pp.
226--235. \[Accessed 24 December 2025\].

Kler, R., Gangurde, R., Elmirzaev, S., Hossain, M.S., Vo, N.V.T.,
Nguyen, T.V.T. and Kumar, P.N. (2022) Optimization of Meat and Poultry
Farm Inventory Stock Using Data Analytics for Green Supply Chain
Network, *Discrete Dynamics in Nature and Society* \[online\]. 2022, pp.
1--8. \[Accessed 23 December 2025\].

Kumar, S. (2023) Dataversity. *No Database Is Perfect: Applying CAP
Theorem to Database Choice* \[online\]. Available
from: [https://www.dataversity.net/no-database-is-perfect-applying-cap-theorem-to-database-choice/](https://www.google.com/url?sa=E&q=https%3A%2F%2Fwww.dataversity.net%2Fno-database-is-perfect-applying-cap-theorem-to-database-choice%2F) \[Accessed
27 December 2025\].

Leishman, E.M., You, J., Ferreira, N.T., Adams, S.M., Tulpan, D.,
Zuidhof, M.J., Gous, R.M., Jacobs, M. and Ellis, J.L. (2023) Review:
When worlds collide -- poultry modeling in the 'Big Data' era, *Animal*
\[online\]. 17(7), p. 100874. \[Accessed 20 December 2025\].

Marmelstein, S., de Araújo Costa, I.P., Terra, A.V., da Silva, R.F., de
Oliveira Capela, G.P., Moreira, M.Â.L., de Souza Rocha Junior, C.,
Simões Gomes, C.F. and dos Santos, M. (2024) Advancing Efficiency
Sustainability in Poultry Farms through Data Envelopment Analysis in a
Brazilian Production System, *Animals* \[online\]. 14(5), p. 726.
\[Accessed 21 December 2025\].

Poudel, A., Davis, J.D., Purswell, J.L., Sharma, S. and Brown-Brandl,
T.M. (2025) Semi-automatic annotation system based on Segment Anything
Model for large scale poultry data annotations, *Animal - Science
Proceedings* \[online\]. 16, pp. 672--674. \[Accessed 23 December
2025\].

Vargas, D.A., De Villena, J.F., Larios, V., Bueno López, R.,
Chávez-Velado, D.R., Casas, D.E., Jiménez, R.L., Blandon, S.E. and
Sanchez-Plata, M.X. (2023) Data-Mining Poultry Processing Bio-Mapping
Counts of Pathogens and Indicator Organisms for Food Safety Management
Decision Making, *Foods* \[online\]. 12(4), p. 898. \[Accessed 20
December 2025\].

Yoon, H., Lee, I., Kang, H., Kim, K.-S. and Lee, E. (2022) Big
data-based risk assessment of poultry farms during the 2020/2021 highly
pathogenic avian influenza epidemic in Korea, *PLOS ONE* \[online\].
17(6), p. e0269311. \[Accessed 21 December 2025\].
