import type { Appeal } from "#/entities/appeal/model/appeal.schema";

export function inspectSyntheticQuality(appeals: Appeal[]) {
  const emailsOk = appeals.every((appeal) =>
    /@(example\.invalid|example\.test)$/.test(appeal.applicant.email),
  );
  const identifiersOk = appeals.every(
    (appeal) => !/^\d{12}$/.test(appeal.applicant.syntheticIdentifier),
  );
  const syntheticOk = appeals.every((appeal) => appeal.synthetic && appeal.applicant.synthetic);
  const externalUrls = appeals.flatMap((appeal) => appeal.description.match(/https?:\/\//g) ?? []);
  return {
    records: appeals.length,
    emailsOk,
    identifiersOk,
    syntheticOk,
    externalUrls: externalUrls.length,
  };
}
