#!/bin/bash

# Capoeira Song Generator Script
# Generates sample songs with GUIDs and inserts them into DynamoDB

set -e

# Load environment variables
ENV_FILE="frontend/.env.local"
if [ -f "$ENV_FILE" ]; then
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
else
    echo "Error: $ENV_FILE not found"
    exit 1
fi

# Sample song titles
SONG_TITLES=(
    "Paranauê"
    "Ê Volta do Mundo"
    "Zum Zum Zum"
    "Boa Noite"
    "Iê Vamos Embora"
    "Água de Beber"
    "Berimbau Bateu"
    "Capoeira da Angola"
    "São Bento Grande"
    "Ladainha"
)

# Sample lyrics
LYRICS_SAMPLES=(
    "Paranauê paranauê paraná
Paranauê paranauê paraná
Todo dia de manhã
Todo dia de manhã
Eu vou na beira da praia
Eu vou na beira da praia"

    "Ê volta do mundo
Volta do mundo que o mundo deu
Volta do mundo que o mundo dá
Volta do mundo
Camará"

    "Zum zum zum
Capoeira mata um
Zum zum zum
Capoeira mata um
A capoeira mata um
Com o golpe da rasteira
A capoeira mata um"

    "Boa noite pra quem é de boa noite
Boa tarde pra quem é de boa tarde
Bom dia pra quem é de bom dia
Adeus que eu vou me embora"

    "Iê vamos embora
Pelo mundo afora
Camará
Iê vamos embora
Vou jogar Angola
Camará"
)

# Function to generate UUID
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        cat /proc/sys/kernel/random/uuid
    fi
}

# Function to get current ISO timestamp
get_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# Function to generate random song data
generate_random_song() {
    local id=$(generate_uuid)
    local timestamp=$(get_timestamp)
    local title="${SONG_TITLES[$RANDOM % ${#SONG_TITLES[@]}]}"
    local has_lyrics=$((RANDOM % 4)) # 75% chance of having lyrics
    local has_mp3=$((RANDOM % 3))    # 66% chance of having mp3
    local has_mp4=$((RANDOM % 4))    # 25% chance of having mp4
    
    # Build JSON item
    local json="{\"id\": {\"S\": \"$id\"}, \"createdAt\": {\"S\": \"$timestamp\"}, \"updatedAt\": {\"S\": \"$timestamp\"}, \"title\": {\"S\": \"$title\"}"
    
    # Add lyrics (75% chance)
    if [ $has_lyrics -gt 0 ]; then
        local lyrics="${LYRICS_SAMPLES[$RANDOM % ${#LYRICS_SAMPLES[@]}]}"
        # Escape newlines and quotes for JSON
        lyrics=$(echo "$lyrics" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
        json="$json, \"lyrics\": {\"S\": \"$lyrics\"}"
    fi
    
    # Add mp3Key (66% chance)
    if [ $has_mp3 -gt 0 ]; then
        local mp3key="songs/${id}.mp3"
        json="$json, \"mp3Key\": {\"S\": \"$mp3key\"}"
    fi
    
    # Add mp4Key (25% chance)
    if [ $has_mp4 -eq 3 ]; then
        local mp4key="videos/${id}.mp4"
        json="$json, \"mp4Key\": {\"S\": \"$mp4key\"}"
    fi
    
    json="$json}"
    echo "$json"
}

# Function to insert song into DynamoDB
insert_song() {
    local json=$1
    
    aws dynamodb put-item \
        --table-name "$DYNAMODB_TABLE_NAME" \
        --item "$json" \
        --region "$AWS_REGION" \
        --endpoint-url https://dynamodb.$AWS_REGION.amazonaws.com \
        --profile bogdan
    
    if [ $? -eq 0 ]; then
        echo "✅ Song inserted successfully!"
    else
        echo "❌ Failed to insert song"
        return 1
    fi
}

# Function for interactive mode
interactive_mode() {
    echo "=== Capoeira Song Generator (Interactive Mode) ==="
    echo ""
    
    read -p "Song title: " title
    [ -z "$title" ] && title="${SONG_TITLES[$RANDOM % ${#SONG_TITLES[@]}]}"
    
    echo ""
    echo "Enter lyrics (press Ctrl+D when done, or leave empty for no lyrics):"
    lyrics=$(cat)
    
    echo ""
    read -p "Has MP3? (y/n, default: n): " has_mp3
    read -p "Has MP4? (y/n, default: n): " has_mp4
    
    local id=$(generate_uuid)
    local timestamp=$(get_timestamp)
    
    # Build JSON
    local json="{\"id\": {\"S\": \"$id\"}, \"createdAt\": {\"S\": \"$timestamp\"}, \"updatedAt\": {\"S\": \"$timestamp\"}, \"title\": {\"S\": \"$title\"}"
    
    if [ -n "$lyrics" ]; then
        lyrics=$(echo "$lyrics" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')
        json="$json, \"lyrics\": {\"S\": \"$lyrics\"}"
    fi
    
    if [ "$has_mp3" = "y" ] || [ "$has_mp3" = "Y" ]; then
        json="$json, \"mp3Key\": {\"S\": \"songs/${id}.mp3\"}"
    fi
    
    if [ "$has_mp4" = "y" ] || [ "$has_mp4" = "Y" ]; then
        json="$json, \"mp4Key\": {\"S\": \"videos/${id}.mp4\"}"
    fi
    
    json="$json}"
    
    echo ""
    echo "Generated item:"
    echo "$json" | jq '.' 2>/dev/null || echo "$json"
    echo ""
    
    read -p "Insert this song into DynamoDB? (y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        insert_song "$json"
        echo "Song ID: $id"
    else
        echo "Cancelled."
    fi
}

# Main script
case "${1:-}" in
    -i|--interactive)
        interactive_mode
        ;;
    -n|--number)
        count=${2:-1}
        echo "Generating $count random song(s)..."
        for ((i=1; i<=count; i++)); do
            echo ""
            echo "Song $i/$count:"
            json=$(generate_random_song)
            echo "$json" | jq '.' 2>/dev/null || echo "$json"
            insert_song "$json"
        done
        ;;
    -h|--help)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  -i, --interactive     Interactive mode (enter song details manually)"
        echo "  -n, --number COUNT    Generate COUNT random songs (default: 1)"
        echo "  -h, --help           Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 -i                 # Interactive mode"
        echo "  $0 -n 5               # Generate 5 random songs"
        echo "  $0                    # Generate 1 random song"
        ;;
    *)
        echo "Generating 1 random song..."
        json=$(generate_random_song)
        echo ""
        echo "$json" | jq '.' 2>/dev/null || echo "$json"
        echo ""
        insert_song "$json"
        ;;
esac

