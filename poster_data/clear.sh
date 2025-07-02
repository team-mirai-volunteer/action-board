#!/bin/bash

echo "🧹 Clearing poster data directories..."
echo "This will remove:"
echo "  - poster_data/data/"
echo "  - poster_data/broken_data/"
echo "  - poster_data/processed-files.json"
echo ""
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    # Remove data directory
    if [ -d "poster_data/data" ]; then
        rm -rf poster_data/data
        echo "✓ Removed poster_data/data/"
    else
        echo "⚠️  poster_data/data/ not found"
    fi

    # Remove broken_data directory
    if [ -d "poster_data/broken_data" ]; then
        rm -rf poster_data/broken_data
        echo "✓ Removed poster_data/broken_data/"
    else
        echo "⚠️  poster_data/broken_data/ not found"
    fi

    # Remove processed files record
    if [ -f "poster_data/processed-files.json" ]; then
        rm -f poster_data/processed-files.json
        echo "✓ Removed poster_data/processed-files.json"
    else
        echo "⚠️  poster_data/processed-files.json not found"
    fi

    echo ""
    echo "✅ Cleanup complete!"
else
    echo "❌ Cleanup cancelled"
fi