const { normalizeOrganisationCode } = require('./common')
const { facultyMap, data } = require('./data')

const ANY = 'ANY'

/**
 * Map from jory IAM to one or more programmes
 */
const joryMap = {
  'grp-avoin-johto': 'H930',
  'grp-kielikeskus-esihenkilot': 'H906', // note, all will be given kojo in kojomap

  'hy-ttdk-tuk-jory': '100-K001',
  'hy-ttdk-tum-jory': '100-M001',
  'hy-oiktdk-on-jory': '200-K001',
  'hy-oiktdk-otm-jory': '200-M001',
  'hy-oiktdk-ibl-jory': '200-M002',
  'hy-oiktdk-ggl-jory': '200-M003',
  'hy-ltdk-psyk-jory': ['300-K001', '300-M004'], // psyk and logo slightly special
  'hy-ltdk-logo-jory': ['300-K002', '300-M005'],
  'hy-ltdk-ll-jory': '300-M001',
  'hy-ltdk-tmed-jory': '300-M002',
  'hy-ltdk-hll-jory': '300-M003',
  'hy-humtdk-filk-jory': '400-K001',
  'hy-humtdk-ttk-jory': '400-K002',
  'hy-humtdk-kik-jory': '400-K003',
  'hy-humtdk-kok-jory': '400-K004',
  'hy-humtdk-kuka-jory': '400-K005',
  'hy-humtdk-hisk-jory': '400-K006',
  'hy-humtdk-ttm-jory': '400-M001',
  'hy-humtdk-kim-jory': '400-M002',
  'hy-humtdk-eng-jory': '400-M003',
  'hy-humtdk-rus-jory': '400-M004',
  'hy-humtdk-lingdig-jory': '400-M005',
  'hy-humtdk-tra-jory': '400-M006',
  'hy-humtdk-suku-jory': '400-M007',
  'hy-humtdk-nor-jory': '400-M008',
  'hy-humtdk-kir-jory': '400-M009',
  'hy-humtdk-kuma-jory': '400-M010',
  'hy-humtdk-ice-jory': '400-M011',
  'hy-humtdk-alku-jory': '400-M012',
  'hy-humtdk-spt-jory': '400-M014',
  'hy-humtdk-hism-jory': '400-M015',
  'hy-mltdk-mat-jory': '500-K001',
  'hy-mltdk-fys-jory': '500-K002',
  'hy-mltdk-kemk-jory': '500-K003',
  'hy-mltdk-mfkk-jory': '500-K004',
  'hy-mltdk-tkt-jory': '500-K005',
  'hy-mltdk-geok-jory': '500-K006',
  'hy-mltdk-maa-jory': '500-K007',
  'hy-mltdk-bsc-jory': '500-K008',
  'hy-mltdk-mast-jory': '500-M001',
  'hy-mltdk-lsi-jory': '500-M002',
  'hy-mltdk-tcm-jory': '500-M003',
  'hy-mltdk-paras-jory': '500-M004',
  'hy-mltdk-matres-jory': '500-M005',
  'hy-mltdk-atm-jory': '500-M006',
  'hy-mltdk-kem-jory': '500-M007',
  'hy-mltdk-mfkm-jory': '500-M008',
  'hy-mltdk-csm-jory': '500-M009',
  'hy-mltdk-data-jory': '500-M010',
  'hy-mltdk-geom-jory': '500-M011',
  'hy-mltdk-geog-jory': '500-M012',
  'hy-mltdk-usp-jory': '500-M013',
  'hy-ftdk-farm-jory': '550-K001',
  'hy-ftdk-prov-jory': '550-M001',
  'hy-ftdk-mpharm-jory': '550-M002',
  'hy-bytdk-bio-jory': '570-K001',
  'hy-bytdk-mole-jory': '570-K002',
  'hy-bytdk-env-jory': '570-K003',
  'hy-bytdk-eeb-jory': '570-M001',
  'hy-bytdk-ips-jory': '570-M002',
  'hy-bytdk-gmb-jory': '570-M003',
  'hy-bytdk-neuro-jory': '570-M004',
  'hy-bytdk-ecgs-jory': '570-M005',
  'hy-ktdk-eduk-jory': '600-K001',
  'hy-ktdk-edum-jory': '600-M001',
  'hy-ktdk-ce-jory': '600-M002',
  'hy-valttdk-pvk-jory': '700-K001',
  'hy-valttdk-yk-jory': '700-K002',
  'hy-valttdk-sosk-jory': '700-K003',
  'hy-valttdk-ecok-jory': '700-K004',
  'hy-valttdk-film-jory': '700-M001',
  'hy-valttdk-pvm-jory': '700-M002',
  'hy-valttdk-gpc-jory': '700-M003',
  'hy-valttdk-ym-jory': '700-M004',
  'hy-valttdk-cos-jory': '700-M005',
  'hy-valttdk-ens-jory': '700-M006',
  'hy-valttdk-msv-jory': '700-M007',
  'hy-valttdk-sosm-jory': '700-M008',
  'hy-valttdk-econ-jory': '700-M009',
  'hy-valttdk-sote-jory': '700-M011',
  'hy-sskh-ksv-jory': '740-K001',
  'hy-mmtdk-maatk-jory': '800-K001',
  'hy-mmtdk-metsak-jory': '800-K002',
  'hy-mmtdk-etk-jory': '800-K003',
  'hy-mmtdk-yet-jory': '800-K004',
  'hy-mmtdk-agri-jory': '800-M001',
  'hy-mmtdk-agere-jory': '800-M002',
  'hy-mmtdk-for-jory': '800-M003',
  'hy-mmtdk-food-jory': '800-M004',
  'hy-mmtdk-hnfb-jory': '800-M005',
  'hy-mmtdk-ekm-jory': '800-M006',
  'hy-mmtdk-mmb-jory': '800-M007',
  'hy-eltdk-elk-jory': '900-K001',
  'hy-eltdk-ell-jory': '900-M001',
  'hy-dp-dptheol-jory': 'T920101',
  'hy-dp-dplaw-jory': 'T920102',
  'hy-dp-philartsoc-jory': 'T920103',
  'hy-dp-dphistcult-jory': 'T920104',
  'hy-dp-dplang-jory': 'T920105',
  'hy-dp-sky-jory': 'T920106',
  'hy-dp-dpsocs-jory': 'T920107',
  'hy-dp-pyam-jory': 'T920108',
  'hy-dp-dpe-jory': 'T920109',
  'hy-dp-seduce-jory': 'T920110',
  'hy-dp-clic-jory': 'T920111',
  'hy-dp-dpbm-jory': 'T921101',
  'hy-dp-klto-jory': 'T921102',
  'hy-dp-docpop-jory': 'T921103',
  'hy-dp-findos-jory': 'T921104',
  'hy-dp-dpdr-jory': 'T921105',
  'hy-dp-ils-jory': 'T921106',
  'hy-dp-bandm-jory': 'T921107',
  'hy-dp-cvm-jory': 'T921108',
  'hy-dp-dphub-jory': 'T921109',
  'hy-dp-luova-jory': 'T922101',
  'hy-dp-dpps-jory': 'T922102',
  'hy-dp-denvi-jory': 'T922103',
  'hy-dp-agforee-jory': 'T922104',
  'hy-dp-mbdp-jory': 'T922105',
  'hy-dp-foodhealth-jory': 'T922106',
  'hy-dp-papu-jory': 'T923101',
  'hy-dp-geodoc-jory': 'T923102',
  'hy-dp-atm-dp-jory': 'T923103',
  'hy-dp-chems-jory': 'T923104',
  'hy-dp-domast-jory': 'T923105',
  'hy-dp-matrena-jory': 'T923106',
  'hy-dp-docs-jory': 'T923107',
}

/**
 * Map from jory IAM to corresponding kojo IAM
 */
const kojoMap = {
  'grp-kielikeskus-esihenkilot': ANY, // special case, gives kojo access to all with this
  'hy-ttdk-tuk-jory': 'hy-ttdk-kandi-kojot',
  'hy-ttdk-tum-jory': 'hy-ttdk-maisteri-kojot',
  'hy-oiktdk-on-jory': 'hy-oiktdk-kandi-kojot',
  'hy-oiktdk-otm-jory': 'hy-oiktdk-maisteri-kojot',
  'hy-oiktdk-ibl-jory': 'hy-oiktdk-maisteri-kojot',
  'hy-oiktdk-ggl-jory': 'hy-oiktdk-maisteri-kojot',
  'hy-ltdk-psyk-jory': 'hy-ltdk-maisteri-kojot',
  'hy-ltdk-logo-jory': 'hy-ltdk-maisteri-kojot',
  'hy-ltdk-ll-jory': 'hy-ltdk-maisteri-kojot',
  'hy-ltdk-tmed-jory': 'hy-ltdk-maisteri-kojot',
  'hy-ltdk-hll-jory': 'hy-ltdk-maisteri-kojot',
  'hy-humtdk-filk-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-ttk-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-kik-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-kok-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-kuka-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-hisk-jory': 'hy-humtdk-kandi-kojot',
  'hy-humtdk-ttm-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-kim-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-eng-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-rus-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-lingdig-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-tra-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-suku-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-nor-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-kir-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-kuma-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-ice-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-alku-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-spt-jory': 'hy-humtdk-maisteri-kojot',
  'hy-humtdk-hism-jory': 'hy-humtdk-maisteri-kojot',
  'hy-mltdk-mat-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-fys-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-kemk-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-mfkk-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-tkt-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-geok-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-maa-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-bsc-jory': 'hy-mltdk-kandi-kojot',
  'hy-mltdk-mast-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-lsi-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-tcm-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-paras-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-matres-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-atm-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-kem-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-mfkm-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-csm-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-data-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-geom-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-geog-jory': 'hy-mltdk-maisteri-kojot',
  'hy-mltdk-usp-jory': 'hy-mltdk-maisteri-kojot',
  'hy-ftdk-farm-jory': 'hy-ftdk-kandi-kojot',
  'hy-ftdk-prov-jory': 'hy-ftdk-maisteri-kojot',
  'hy-ftdk-mpharm-jory': 'hy-ftdk-maisteri-kojot',
  'hy-bytdk-bio-jory': 'hy-bytdk-kandi-kojot',
  'hy-bytdk-mole-jory': 'hy-bytdk-kandi-kojot',
  'hy-bytdk-env-jory': 'hy-bytdk-kandi-kojot',
  'hy-bytdk-eeb-jory': 'hy-bytdk-maisteri-kojot',
  'hy-bytdk-ips-jory': 'hy-bytdk-maisteri-kojot',
  'hy-bytdk-gmb-jory': 'hy-bytdk-maisteri-kojot',
  'hy-bytdk-neuro-jory': 'hy-bytdk-maisteri-kojot',
  'hy-bytdk-ecgs-jory': 'hy-bytdk-maisteri-kojot',
  'hy-ktdk-eduk-jory': 'hy-ktdk-kandi-kojot',
  'hy-ktdk-edum-jory': 'hy-ktdk-maisteri-kojot',
  'hy-ktdk-ce-jory': 'hy-ktdk-maisteri-kojot',
  'hy-valttdk-pvk-jory': 'hy-valttdk-kandi-kojot',
  'hy-valttdk-yk-jory': 'hy-valttdk-kandi-kojot',
  'hy-valttdk-sosk-jory': 'hy-valttdk-kandi-kojot',
  'hy-valttdk-ecok-jory': 'hy-valttdk-kandi-kojot',
  'hy-valttdk-film-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-pvm-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-gpc-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-ym-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-cos-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-ens-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-msv-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-sosm-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-econ-jory': 'hy-valttdk-maisteri-kojot',
  'hy-valttdk-sote-jory': 'hy-valttdk-maisteri-kojot',
  'hy-sskh-ksv-jory': 'hy-sskh-kandi-kojot',
  'hy-mmtdk-maatk-jory': 'hy-mmtdk-kandi-kojot',
  'hy-mmtdk-metsak-jory': 'hy-mmtdk-kandi-kojot',
  'hy-mmtdk-etk-jory': 'hy-mmtdk-kandi-kojot',
  'hy-mmtdk-yet-jory': 'hy-mmtdk-kandi-kojot',
  'hy-mmtdk-agri-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-agere-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-for-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-food-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-hnfb-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-ekm-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-mmtdk-mmb-jory': 'hy-mmtdk-maisteri-kojot',
  'hy-eltdk-elk-jory': 'hy-eltdk-kandi-kojot',
  'hy-eltdk-ell-jory': 'hy-eltdk-maisteri-kojot',
  'hy-dp-dptheol-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dplaw-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-philartsoc-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dphistcult-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dplang-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-sky-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dpsocs-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-pyam-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dpe-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-seduce-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-clic-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dpbm-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-klto-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-docpop-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-findos-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dpdr-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-ils-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-bandm-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-cvm-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dphub-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-luova-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-dpps-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-denvi-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-agforee-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-mbdp-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-foodhealth-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-papu-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-geodoc-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-atm-dp-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-chems-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-domast-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-matrena-jory': 'hy-tohtoriohjelma-johtajat',
  'hy-dp-docs-jory': 'hy-tohtoriohjelma-johtajat',
}

/**
 * Maps kosu IAM to the name of TDKs, defined in data.js facultyMap
 */
const kosuFacultyMap = {
  'hy-ypa-opa-kosu-kumpula': ['matemaattis-luonnontieteellinen'],
  'hy-ypa-opa-kosu-meilahti': ['lääketieteellinen'],
  'hy-ypa-opa-kosu-kruununhaka': [
    'oikeustieteellinen',
    'valtiotieteellinen',
    'kasvatustieteellinen',
    'humanistinen',
    'teologinen',
    'svenska',
  ],
  'hy-ypa-opa-kosu-metsatalo': [
    'oikeustieteellinen',
    'valtiotieteellinen',
    'kasvatustieteellinen',
    'humanistinen',
    'teologinen',
    'svenska',
  ],
  'hy-ypa-opa-kosu-porthania': [
    'oikeustieteellinen',
    'valtiotieteellinen',
    'kasvatustieteellinen',
    'humanistinen',
    'teologinen',
    'svenska',
  ],
  'hy-ypa-opa-kosu-siltavuori': [
    'oikeustieteellinen',
    'valtiotieteellinen',
    'kasvatustieteellinen',
    'humanistinen',
    'teologinen',
    'svenska',
  ],
  'hy-ypa-opa-kosu-viikki': [
    'bio- ja ympäristötieteellinen',
    'farmasia',
    'maatalous-metsätieteellinen',
    'eläinlääketieteellinen',
  ],
}

const doctoralIams = ['hy-tohtorikoulutus-johtoryhma', 'hy-tine']

const doctoralSchoolMap = {
  'hy-tutkijakoulut-hymy-jory': [
    'T920101',
    'T920102',
    'T920103',
    'T920104',
    'T920105',
    'T920106',
    'T920107',
    'T920108',
    'T920109',
    'T920110',
    'T920111',
  ],
  'hy-tutkijakoulut-dshealth-jory': [
    'T921101',
    'T921102',
    'T921103',
    'T921104',
    'T921105',
    'T921106',
    'T921107',
    'T921108',
    'T921109',
  ],
  'hy-tutkijakoulut-yeb-jory': [
    'T922101',
    'T922102',
    'T922103',
    'T922104',
    'T922105',
    'T922106',
  ],
  'hy-tutkijakoulut-donasci-jory': [
    'T923101',
    'T923102',
    'T923103',
    'T923104',
    'T923105',
    'T923106',
    'T923107',
  ],
}

const opetusVaradekaani = 'hy-varadekaanit-opetus'

const dekaaniFacultyMap = {
  'hy-ttdk-dekanaatti': 'teologinen',
  'hy-oiktdk-dekanaatti': 'oikeustieteellinen',
  'hy-ltdk-dekanaatti': 'lääketieteellinen',
  'hy-humtdk-dekanaatti': 'humanistinen',
  'hy-mltdk-dekanaatti': 'matemaattis-luonnontieteellinen',
  'hy-ftdk-dekanaatti': 'farmasia',
  'hy-bytdk-dekanaatti': 'bio- ja ympäristötieteellinen',
  'hy-ktdk-dekanaatti': 'kasvatustieteellinen',
  'hy-valttdk-dekanaatti': 'valtiotieteellinen',
  'hy-sskh-rehtoraatti': 'svenska',
  'hy-mmtdk-dekanaatti': 'maatalous -metsätieteellinen',
  'hy-eltdk-dekanaatti': 'eläinlääketieteellinen',
}

const universityWideGroups = [
  'hy-ypa-opa-opintoasiainpaallikot',
  'hy-ypa-opa-ospa',
  'hy-rehtoraatti',
]

const superAdminGroups = ['grp-toska']

const adminGroups = ['grp-ospa']

const employeeGroups = ['hy-employees']

const isSuperAdminIam = (iam) => superAdminGroups.includes(iam)

const isAdminIam = (iam) => adminGroups.includes(iam)

const isUniversityWideIam = (iam) => universityWideGroups.includes(iam)

const isDoctoralIam = (iam) => doctoralIams.includes(iam)

const isEmployeeIam = (iam) => employeeGroups.includes(iam)

const iamToDoctoralSchool = (iam) => doctoralSchoolMap[iam]

const getStudyLeaderGroup = (iam) => kojoMap[iam]

const isStudyLeaderGroup = (iam, allIams) =>
  allIams.concat('ANY').includes(getStudyLeaderGroup(iam))

const iamToOrganisationCode = (iam) => {
  const organisationCodes = joryMap[iam]
  if (Array.isArray(organisationCodes)) {
    return organisationCodes
  }
  return [organisationCodes]
}

const kosuIamToFaculties = (iam) => {
  const faculties = kosuFacultyMap[iam]
  if (!faculties?.length > 0) return []

  return faculties.map((f) => facultyMap[f])
}

const dekaaniIamToFaculty = (iam) => {
  const faculty = dekaaniFacultyMap[iam]
  if (!faculty) return null
  return facultyMap[faculty]
}

const relevantIAMs = []
  .concat(Object.keys(joryMap))
  .concat(Object.keys(kojoMap))
  .concat(Object.values(kojoMap))
  .concat(Object.keys(kosuFacultyMap))
  .concat(Object.keys(dekaaniFacultyMap))
  .concat(opetusVaradekaani)
  .concat(doctoralIams)
  .concat(Object.keys(doctoralSchoolMap))
  .concat(universityWideGroups)
  .concat(superAdminGroups)
  .concat(adminGroups)
  .concat(employeeGroups)

const RELEVANT_ORGANISATION_CODES = [
  'H906', // Kielikeskus
  'H930', // Avoin yliopisto
]

const relevantOrganisations = RELEVANT_ORGANISATION_CODES.concat(
  data.map((faculty) => faculty.code),
).concat(
  data.flatMap((faculty) =>
    faculty.programmes.map((programme) =>
      normalizeOrganisationCode(programme.key),
    ),
  ),
)

module.exports = {
  isSuperAdminIam,
  isAdminIam,
  isUniversityWideIam,
  isDoctoralIam,
  isEmployeeIam,
  iamToDoctoralSchool,
  iamToOrganisationCode,
  kosuIamToFaculties,
  dekaaniIamToFaculty,
  opetusVaradekaani,
  getStudyLeaderGroup,
  isStudyLeaderGroup,
  relevantIAMs,
  relevantOrganisations,
  ANY,
}
