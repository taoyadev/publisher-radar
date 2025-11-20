#!/usr/bin/env python3
import json
import psycopg2
from datetime import date

BATCH_SIZE = 1000
today = str(date.today())

def import_sellers():
    print('🚀 Starting sellers.json import...')

    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host='localhost',
        port=54322,
        database='postgres',
        user='postgres',
        password='postgres'
    )
    conn.autocommit = False
    cur = conn.cursor()

    # Read sellers.json
    print('📥 Reading sellers.json...')
    with open('/tmp/sellers.json', 'r') as f:
        data = json.load(f)

    sellers = data['sellers']
    print(f'✅ Loaded {len(sellers):,} sellers')

    # Prepare data
    records = []
    domains_records = []

    for s in sellers:
        seller_id = s['seller_id']
        seller_type = s.get('seller_type', 'PUBLISHER')
        is_confidential = s.get('is_confidential', 0) == 1
        name = s.get('name')
        domain = s.get('domain')

        records.append((
            seller_id,
            today,
            seller_type,
            is_confidential,
            name,
            domain
        ))

        if domain:
            domains_records.append((
                seller_id,
                domain,
                today,
                'sellers_json',
                1.0
            ))

    print(f'🔄 Transformed {len(records):,} records')
    print(f'🔗 Found {len(domains_records):,} domains')

    # Batch insert sellers
    inserted = 0
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]

        try:
            cur.executemany("""
                INSERT INTO seller_adsense.sellers
                (seller_id, first_seen_date, seller_type, is_confidential, name, domain)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (seller_id) DO UPDATE SET
                    seller_type = EXCLUDED.seller_type,
                    is_confidential = EXCLUDED.is_confidential,
                    name = EXCLUDED.name,
                    domain = EXCLUDED.domain,
                    updated_at = NOW()
            """, batch)

            conn.commit()
            inserted += len(batch)
            progress = (i + len(batch)) / len(records) * 100
            print(f'📊 Progress: {progress:.1f}% ({i + len(batch):,}/{len(records):,})')

        except Exception as e:
            print(f'❌ Error inserting batch {i // BATCH_SIZE + 1}: {e}')
            conn.rollback()

    print(f'\n✅ Import complete!')
    print(f'   Inserted: {inserted:,}')

    # Create snapshot
    print('\n📸 Creating initial snapshot...')
    try:
        cur.execute("""
            INSERT INTO seller_adsense.daily_snapshots
            (snapshot_date, total_count, new_count, removed_count)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (snapshot_date) DO UPDATE SET
                total_count = EXCLUDED.total_count,
                new_count = EXCLUDED.new_count
        """, (today, len(records), len(records), 0))
        conn.commit()
        print('✅ Snapshot created')
    except Exception as e:
        print(f'❌ Error creating snapshot: {e}')
        conn.rollback()

    # Insert domains
    print(f'\n🔗 Inserting {len(domains_records):,} domains...')
    for i in range(0, len(domains_records), BATCH_SIZE):
        batch = domains_records[i:i + BATCH_SIZE]

        try:
            cur.executemany("""
                INSERT INTO seller_adsense.seller_domains
                (seller_id, domain, first_detected, detection_source, confidence_score)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (seller_id, domain) DO NOTHING
            """, batch)
            conn.commit()

            progress = (i + len(batch)) / len(domains_records) * 100
            print(f'📊 Domains progress: {progress:.1f}% ({i + len(batch):,}/{len(domains_records):,})')

        except Exception as e:
            print(f'❌ Error inserting domain batch: {e}')
            conn.rollback()

    cur.close()
    conn.close()
    print('\n🎉 All done!')

if __name__ == '__main__':
    try:
        import_sellers()
    except Exception as e:
        print(f'💥 Fatal error: {e}')
        import traceback
        traceback.print_exc()
        exit(1)
