--
-- PostgreSQL database dump
--

\restrict T9t3wjDzbawWKfmg3ENBs1cfbiniAM6pi6BIu6VMNEe3XHqeN1PExcoVm7bKPbQ

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'OWNER',
    'STAFF'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SequenceType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SequenceType" AS ENUM (
    'STK',
    'RCPT'
);


ALTER TYPE public."SequenceType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: DailySequence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DailySequence" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "dateKey" text NOT NULL,
    type public."SequenceType" NOT NULL,
    "lastSeq" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."DailySequence" OWNER TO postgres;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    "sellingPrice" numeric(12,2) NOT NULL,
    "reorderLevel" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "receiptNo" text NOT NULL,
    "soldByUserId" uuid NOT NULL,
    "soldAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paymentMethod" text,
    note text
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: SaleItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SaleItem" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "saleId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    qty integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "lineTotal" numeric(12,2) NOT NULL
);


ALTER TABLE public."SaleItem" OWNER TO postgres;

--
-- Name: SaleLotAllocation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SaleLotAllocation" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "saleId" uuid NOT NULL,
    "saleItemId" uuid NOT NULL,
    "stockLotId" uuid NOT NULL,
    "qtyTaken" integer NOT NULL
);


ALTER TABLE public."SaleLotAllocation" OWNER TO postgres;

--
-- Name: StockIn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockIn" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "refNo" text NOT NULL,
    "createdByUserId" uuid NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    note text
);


ALTER TABLE public."StockIn" OWNER TO postgres;

--
-- Name: StockInItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockInItem" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "stockInId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    "qtyAdded" integer NOT NULL,
    "expiryDate" date NOT NULL
);


ALTER TABLE public."StockInItem" OWNER TO postgres;

--
-- Name: StockLot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StockLot" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "productId" uuid NOT NULL,
    "stockInItemId" uuid,
    "lotRefNo" text NOT NULL,
    "expiryDate" date NOT NULL,
    "qtyRemaining" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdByUserId" uuid NOT NULL
);


ALTER TABLE public."StockLot" OWNER TO postgres;

--
-- Name: Store; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Store" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "backupFolder" text DEFAULT 'C:\EliMed\Backups'::text NOT NULL
);


ALTER TABLE public."Store" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    username text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: DailySequence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DailySequence" (id, "dateKey", type, "lastSeq") FROM stdin;
b9ac8116-406e-432a-bb7c-9555559b3b79	20260131	STK	2
ee76e7eb-f71a-4c7d-9cdd-9c0df45c810e	20260131	RCPT	1
7c32bb81-de80-49aa-a556-500a98c78992	20260201	STK	2
ca6c91ec-1a7c-4612-be7d-f158fa2ead15	20260201	RCPT	2
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, "sellingPrice", "reorderLevel", "isActive", "createdAt", "updatedAt") FROM stdin;
1585b407-c5f8-4d41-b5bc-60c0f5ac9935	Panadol Extra	300.00	20	t	2026-01-31 22:07:10.67	2026-01-31 22:07:10.67
edfbc234-54f7-4449-9af6-0632d844276f	Panadol	200.00	30	t	2026-01-31 22:18:04.088	2026-01-31 22:18:04.088
685cb70d-028d-40a2-83f3-bc7caac00b35	Pepsi	500.00	12	t	2026-02-01 11:37:55.592	2026-02-01 11:37:55.592
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "receiptNo", "soldByUserId", "soldAt", "totalAmount", "paymentMethod", note) FROM stdin;
e30130b1-49a8-4fa6-9ca0-f0943cdde495	RCPT-20260131-0001	7dc9922f-8921-4c16-a287-22ee077704dd	2026-01-31 22:49:12.363	1100.00	Cash	\N
57b972c0-2b93-439c-b51d-3c27cd434603	RCPT-20260201-0001	7dc9922f-8921-4c16-a287-22ee077704dd	2026-02-01 11:12:31.204	500.00	Cash	\N
a548724a-e593-431d-b6b9-8061f8d450e8	RCPT-20260201-0002	7dc9922f-8921-4c16-a287-22ee077704dd	2026-02-01 11:57:01.76	1000.00	Cash	\N
\.


--
-- Data for Name: SaleItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SaleItem" (id, "saleId", "productId", qty, "unitPrice", "lineTotal") FROM stdin;
fe6e23a3-edf9-4e3d-a7c8-17dc6d5ce0f6	e30130b1-49a8-4fa6-9ca0-f0943cdde495	edfbc234-54f7-4449-9af6-0632d844276f	4	200.00	800.00
e59b87e7-6126-424e-9971-2a8b11256053	e30130b1-49a8-4fa6-9ca0-f0943cdde495	1585b407-c5f8-4d41-b5bc-60c0f5ac9935	1	300.00	300.00
ca9426f6-1f0a-4d87-846d-031b38851e7d	57b972c0-2b93-439c-b51d-3c27cd434603	edfbc234-54f7-4449-9af6-0632d844276f	1	200.00	200.00
abf36d70-9e09-47b4-baa5-f4f5f1d2804a	57b972c0-2b93-439c-b51d-3c27cd434603	1585b407-c5f8-4d41-b5bc-60c0f5ac9935	1	300.00	300.00
b7062163-7d36-4f7b-b334-188fccd9e9a1	a548724a-e593-431d-b6b9-8061f8d450e8	edfbc234-54f7-4449-9af6-0632d844276f	1	200.00	200.00
d8963ed5-5d8b-4677-bafe-d4135109a96d	a548724a-e593-431d-b6b9-8061f8d450e8	685cb70d-028d-40a2-83f3-bc7caac00b35	1	500.00	500.00
b9e08f9a-5768-44de-ae3e-e8a0d001e046	a548724a-e593-431d-b6b9-8061f8d450e8	1585b407-c5f8-4d41-b5bc-60c0f5ac9935	1	300.00	300.00
\.


--
-- Data for Name: SaleLotAllocation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SaleLotAllocation" (id, "saleId", "saleItemId", "stockLotId", "qtyTaken") FROM stdin;
5bdbccb1-e99d-4e54-b0e8-527bf4a3ba6b	e30130b1-49a8-4fa6-9ca0-f0943cdde495	fe6e23a3-edf9-4e3d-a7c8-17dc6d5ce0f6	419ba8a2-25c8-4be5-8784-3b26a1859b57	4
06b259a6-767b-4189-9b09-bc4fe21cb3f9	e30130b1-49a8-4fa6-9ca0-f0943cdde495	e59b87e7-6126-424e-9971-2a8b11256053	84428287-a665-4499-8012-08b06a350c57	1
b3773cd9-a4ac-4585-aa37-993d21e50355	57b972c0-2b93-439c-b51d-3c27cd434603	ca9426f6-1f0a-4d87-846d-031b38851e7d	419ba8a2-25c8-4be5-8784-3b26a1859b57	1
59f2df85-47e9-4202-8040-1aadf330add4	57b972c0-2b93-439c-b51d-3c27cd434603	abf36d70-9e09-47b4-baa5-f4f5f1d2804a	84428287-a665-4499-8012-08b06a350c57	1
580534ad-0d8c-4e25-a6c1-278afa5454c5	a548724a-e593-431d-b6b9-8061f8d450e8	b7062163-7d36-4f7b-b334-188fccd9e9a1	419ba8a2-25c8-4be5-8784-3b26a1859b57	1
a4310695-3a2f-4176-b172-8deed4a34f6a	a548724a-e593-431d-b6b9-8061f8d450e8	d8963ed5-5d8b-4677-bafe-d4135109a96d	eb15c254-158d-4df8-876f-b3252d553e0d	1
54606aaa-b4d6-4f43-879b-add99c8acfb1	a548724a-e593-431d-b6b9-8061f8d450e8	b9e08f9a-5768-44de-ae3e-e8a0d001e046	84428287-a665-4499-8012-08b06a350c57	1
\.


--
-- Data for Name: StockIn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockIn" (id, "refNo", "createdByUserId", "createdAt", note) FROM stdin;
f82d9e4d-c17b-4a08-bf78-b7db450c0a4f	STK-20260131-0001	7dc9922f-8921-4c16-a287-22ee077704dd	2026-01-31 22:36:01.84	\N
a30efb99-738d-4c34-94a5-787635afc4ee	STK-20260131-0002	7dc9922f-8921-4c16-a287-22ee077704dd	2026-01-31 22:40:21.523	\N
5be61dd5-508a-4bba-b79c-2b482dec6dc4	STK-20260201-0001	7dc9922f-8921-4c16-a287-22ee077704dd	2026-02-01 11:27:55.354	\N
dfd48fb6-8a35-41ca-9552-f2251dff9f2d	STK-20260201-0002	7dc9922f-8921-4c16-a287-22ee077704dd	2026-02-01 11:38:31.199	\N
\.


--
-- Data for Name: StockInItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockInItem" (id, "stockInId", "productId", "qtyAdded", "expiryDate") FROM stdin;
cf5cd64c-a738-4816-b52d-5a41c643ab26	f82d9e4d-c17b-4a08-bf78-b7db450c0a4f	edfbc234-54f7-4449-9af6-0632d844276f	3000	2026-01-31
dec5586d-e334-40a9-8671-9b215f392981	a30efb99-738d-4c34-94a5-787635afc4ee	1585b407-c5f8-4d41-b5bc-60c0f5ac9935	4000	2026-01-31
a8baa09a-68de-4355-9054-18d8623d7282	5be61dd5-508a-4bba-b79c-2b482dec6dc4	edfbc234-54f7-4449-9af6-0632d844276f	500	2026-02-08
c8554545-8081-45f7-bf26-3e1e91fd3939	dfd48fb6-8a35-41ca-9552-f2251dff9f2d	685cb70d-028d-40a2-83f3-bc7caac00b35	5000	2026-12-30
\.


--
-- Data for Name: StockLot; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StockLot" (id, "productId", "stockInItemId", "lotRefNo", "expiryDate", "qtyRemaining", "createdAt", "createdByUserId") FROM stdin;
21f1e189-17e4-45d0-9c1f-d66c7687fb48	edfbc234-54f7-4449-9af6-0632d844276f	a8baa09a-68de-4355-9054-18d8623d7282	STK-20260201-0001	2026-02-08	500	2026-02-01 11:27:55.37	7dc9922f-8921-4c16-a287-22ee077704dd
419ba8a2-25c8-4be5-8784-3b26a1859b57	edfbc234-54f7-4449-9af6-0632d844276f	cf5cd64c-a738-4816-b52d-5a41c643ab26	STK-20260131-0001	2026-01-31	2994	2026-01-31 22:36:01.864	7dc9922f-8921-4c16-a287-22ee077704dd
eb15c254-158d-4df8-876f-b3252d553e0d	685cb70d-028d-40a2-83f3-bc7caac00b35	c8554545-8081-45f7-bf26-3e1e91fd3939	STK-20260201-0002	2026-12-30	4999	2026-02-01 11:38:31.21	7dc9922f-8921-4c16-a287-22ee077704dd
84428287-a665-4499-8012-08b06a350c57	1585b407-c5f8-4d41-b5bc-60c0f5ac9935	dec5586d-e334-40a9-8671-9b215f392981	STK-20260131-0002	2026-01-31	3997	2026-01-31 22:40:21.547	7dc9922f-8921-4c16-a287-22ee077704dd
\.


--
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Store" (id, name, address, phone, "createdAt", "updatedAt", "backupFolder") FROM stdin;
467e5b94-e847-48b4-8975-56688ab9a174	EliMed Pharmacy	2, Prince fabian street Aradagun	08029984701	2026-02-02 08:08:09.347	2026-02-02 08:25:29.115	C:\\EliMed\\Backups
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, username, "passwordHash", role, "isActive", "createdAt") FROM stdin;
7dc9922f-8921-4c16-a287-22ee077704dd	Sylvester Oputa	Sylvester	$2b$10$cdbmtJgzmVbchMnLonYJMua6FefVsJxwfuOjRT/6Y/sfjOitsncz6	OWNER	t	2026-01-31 20:32:47.947
13fcf1e8-7b0d-4ee7-b414-235b482617cb	Joy man	Joyboi	$2b$10$e1Mqn1/MdkkMsLTW7JCjvephFVtp8ZdYushrYA7UZR9CcKb1fKBFe	STAFF	t	2026-02-01 12:33:50.257
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
cc5dd694-f0cb-4e2e-9815-5ce453b868cd	f76c1af3708a1a0ec2ef54d3f6617979b127b247c4b05cb7326cfd34a879c075	2026-01-31 21:19:26.714104+01	20260127234401_init	\N	\N	2026-01-31 21:19:26.55119+01	1
77c98592-45ad-4863-8284-cf8b7a97beea	8beb2dbc1c6c7d34a03dc69f69c2b7426a1745bcfafd41f9751aa8d75df4e205	2026-01-31 21:19:26.733925+01	20260128_add_product_unique	\N	\N	2026-01-31 21:19:26.715551+01	1
12853413-bcc8-43b9-9acc-fda0b35daea6	52e6bf3926d73a9deeb0972e4735062218c5cc01617f41c67361fd7f560d2b79	2026-01-31 21:19:26.873129+01	20260129_fefo_lots	\N	\N	2026-01-31 21:19:26.735565+01	1
7fce82c7-a55c-4869-9562-ded1ea02ee3c	9ae0caf614003584288080e95afbe0609e9f29c24b4238e8faf6961cb0227a83	2026-02-01 13:49:28.214032+01	20260201124928_add_store_table	\N	\N	2026-02-01 13:49:28.184446+01	1
f0602a05-00cf-4a9c-8813-77b718e6b9eb	5c8ca6ae17c5c7dccf273e11d4e7369af5b60eaf4bf90e15324caf234158897a	2026-02-02 11:00:46.336974+01	20260202100046_add_backup_folder_to_store	\N	\N	2026-02-02 11:00:46.311303+01	1
\.


--
-- Name: DailySequence DailySequence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DailySequence"
    ADD CONSTRAINT "DailySequence_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: SaleItem SaleItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY (id);


--
-- Name: SaleLotAllocation SaleLotAllocation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleLotAllocation"
    ADD CONSTRAINT "SaleLotAllocation_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: StockInItem StockInItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockInItem"
    ADD CONSTRAINT "StockInItem_pkey" PRIMARY KEY (id);


--
-- Name: StockIn StockIn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockIn"
    ADD CONSTRAINT "StockIn_pkey" PRIMARY KEY (id);


--
-- Name: StockLot StockLot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLot"
    ADD CONSTRAINT "StockLot_pkey" PRIMARY KEY (id);


--
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: DailySequence_dateKey_type_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "DailySequence_dateKey_type_key" ON public."DailySequence" USING btree ("dateKey", type);


--
-- Name: Product_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Product_name_key" ON public."Product" USING btree (name);


--
-- Name: Sale_receiptNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sale_receiptNo_key" ON public."Sale" USING btree ("receiptNo");


--
-- Name: StockIn_refNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "StockIn_refNo_key" ON public."StockIn" USING btree ("refNo");


--
-- Name: StockLot_productId_expiryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StockLot_productId_expiryDate_idx" ON public."StockLot" USING btree ("productId", "expiryDate");


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: SaleItem SaleItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleItem SaleItem_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleItem"
    ADD CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleLotAllocation SaleLotAllocation_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleLotAllocation"
    ADD CONSTRAINT "SaleLotAllocation_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public."Sale"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleLotAllocation SaleLotAllocation_saleItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleLotAllocation"
    ADD CONSTRAINT "SaleLotAllocation_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES public."SaleItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SaleLotAllocation SaleLotAllocation_stockLotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SaleLotAllocation"
    ADD CONSTRAINT "SaleLotAllocation_stockLotId_fkey" FOREIGN KEY ("stockLotId") REFERENCES public."StockLot"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sale Sale_soldByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_soldByUserId_fkey" FOREIGN KEY ("soldByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockInItem StockInItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockInItem"
    ADD CONSTRAINT "StockInItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockInItem StockInItem_stockInId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockInItem"
    ADD CONSTRAINT "StockInItem_stockInId_fkey" FOREIGN KEY ("stockInId") REFERENCES public."StockIn"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockIn StockIn_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockIn"
    ADD CONSTRAINT "StockIn_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockLot StockLot_createdByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLot"
    ADD CONSTRAINT "StockLot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockLot StockLot_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLot"
    ADD CONSTRAINT "StockLot_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockLot StockLot_stockInItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StockLot"
    ADD CONSTRAINT "StockLot_stockInItemId_fkey" FOREIGN KEY ("stockInItemId") REFERENCES public."StockInItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict T9t3wjDzbawWKfmg3ENBs1cfbiniAM6pi6BIu6VMNEe3XHqeN1PExcoVm7bKPbQ

