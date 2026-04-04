# Runbook: ACS Email Sender + Static Web App Domain (isourgame.com)

This runbook configures:

- Azure Communication Services (ACS) sender domain on `isourgame.com`
- Azure Static Web App custom domain `football.isourgame.com`

## Preconditions

- `isourgame.com` is delegated to Azure DNS.
- You have an Email Communication Service and Communication Service in the same subscription.
- You have a Static Web App deployed.

## 1) Verify ACS custom email domain

In Azure Portal:

1. Open the Email Communication Service resource.
2. Go to Provision Domains > Add domain > Custom domain.
3. Enter `isourgame.com`.
4. Add the TXT verification record exactly as shown by the portal.
5. Wait for Domain verification to complete.

Then configure sender auth records from the same blade:

- SPF TXT
- DKIM CNAME (selector1)
- DKIM2 CNAME (selector2)

Notes:

- Keep one SPF TXT record only at the root.
- If another provider already uses SPF, merge includes into one SPF record.
- ACS verification expects SPF to end with `-all`.

## 2) Link the verified domain to the Communication Service

If not already linked in portal, use CLI:

```bash
az communication email domain show \
  --domain-name isourgame.com \
  --email-service-name <email-service-name> \
  --resource-group <resource-group> \
  --query id -o tsv
```

Copy the domain resource id, then link it:

```bash
az communication update \
  --name <communication-service-name> \
  --resource-group <resource-group> \
  --linked-domains <domain-resource-id>
```

## 3) Set Function app sender address

This repo now supports sender parameters in Bicep:

- `emailSenderLocalPart`
- `emailSenderCustomDomain`

`infrastructure/parameters-subscription.json` is pre-set to:

- `emailSenderLocalPart = noreply`
- `emailSenderCustomDomain = isourgame.com`

Deploy (subscription-scope template):

```bash
az deployment sub create \
  --location westeurope \
  --template-file infrastructure/main-subscription.bicep \
  --parameters @infrastructure/parameters-subscription.json \
  --parameters sqlAdminUsername=<sql-admin-user> sqlAdminPassword='<sql-admin-password>'
```

Or set app setting directly:

```bash
az functionapp config appsettings set \
  --name <function-app-name> \
  --resource-group <resource-group> \
  --settings AzureCommunicationServices__SenderAddress=noreply@isourgame.com
```

## 4) Add Static Web App custom domain via Bicep

This repo now supports Static Web App hostname setup in Bicep. It creates:

- Azure DNS CNAME record (`football` -> Static Web App default host)
- Static Web App custom domain binding (`football.isourgame.com`)

`infrastructure/parameters-subscription.json` is pre-set to:

- `staticWebCustomDomainHostName = football.isourgame.com`
- `staticWebCustomDomainDnsZoneName = isourgame.com`
- `staticWebCustomDomainDnsRecordSetName = football`
- `staticWebCustomDomainDnsTtl = 3600`

Deploy (same command as step 3):

```bash
az deployment sub create \
  --location westeurope \
  --template-file infrastructure/main-subscription.bicep \
  --parameters @infrastructure/parameters-subscription.json \
  --parameters sqlAdminUsername=<sql-admin-user> sqlAdminPassword='<sql-admin-password>'
```

Important:

- The DNS zone must exist in the same resource group scope where `main.bicep` runs (here, `rgourgame`).
- If your DNS zone is in a different resource group, either move the zone or keep using portal/CLI for the custom-domain step.

## 5) Validate

```bash
nslookup -type=TXT isourgame.com
nslookup -type=CNAME football.isourgame.com
```

Open:

- `https://football.isourgame.com`

Confirm HTTPS certificate is issued and site loads.

## 6) Recommended DNS hardening

Add DMARC record:

- Name: `_dmarc`
- Type: `TXT`
- Value: `v=DMARC1; p=none; rua=mailto:dmarc@isourgame.com`

After monitoring, move policy to `quarantine` or `reject`.
