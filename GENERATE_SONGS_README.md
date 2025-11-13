# Song Generator Script

A convenient shell script to generate and insert capoeira songs into DynamoDB with GUIDs and sample data.

## Prerequisites

- AWS CLI installed and configured
- `jq` (optional, for pretty JSON output)
- Proper AWS credentials set in `frontend/.env.local`

## Usage

### Generate 1 Random Song (Default)

```bash
./generate-song.sh
```

### Generate Multiple Random Songs

```bash
./generate-song.sh -n 5
```

This will generate 5 random songs with:
- Unique UUID for each song
- Random title from a pool of traditional capoeira songs
- 75% chance of having lyrics
- 66% chance of having mp3Key
- 25% chance of having mp4Key
- Current timestamp for createdAt and updatedAt

### Interactive Mode

```bash
./generate-song.sh -i
```

This mode allows you to:
- Enter a custom title
- Paste or type lyrics (press Ctrl+D when done)
- Choose whether to include mp3Key
- Choose whether to include mp4Key
- Preview the JSON before inserting
- Confirm before insertion

### Help

```bash
./generate-song.sh -h
```

## Sample Data Included

The script includes sample data for:

**Song Titles:**
- Paranauê
- Ê Volta do Mundo
- Zum Zum Zum
- Boa Noite
- Iê Vamos Embora
- Água de Beber
- Berimbau Bateu
- Capoeira da Angola
- São Bento Grande
- Ladainha

**Lyrics:**
- Traditional capoeira lyrics for several songs

## Generated Fields

Each song will have:
- `id` (String) - UUID v4
- `createdAt` (String) - ISO 8601 timestamp
- `updatedAt` (String) - ISO 8601 timestamp
- `title` (String) - Song title
- `lyrics` (String, optional) - Song lyrics
- `mp3Key` (String, optional) - S3 key in format `songs/{id}.mp3`
- `mp4Key` (String, optional) - S3 key in format `videos/{id}.mp4`

## Examples

### Example 1: Quick Testing
```bash
# Generate 10 test songs at once
./generate-song.sh -n 10
```

### Example 2: Add Specific Song
```bash
# Use interactive mode to add a specific song with exact lyrics
./generate-song.sh -i
```

### Example 3: Single Random Song
```bash
# Just run the script without arguments
./generate-song.sh
```

## Notes

- The script reads AWS credentials from `frontend/.env.local`
- S3 keys are generated but files are NOT uploaded automatically
- To actually play audio/video, you'll need to upload the corresponding files to S3
- The script uses `uuidgen` or `/proc/sys/kernel/random/uuid` for UUID generation



