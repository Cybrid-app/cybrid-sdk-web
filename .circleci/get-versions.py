import json

def main():
    # load chromium stable version json
    versions = open('versions.json')
    versions = json.load(versions)

    # get 2 previous major versions
    currentMajorVersion = versions[0].split(".")[0]
    testMajorVersions = [str(int(currentMajorVersion) - 1), str(int(currentMajorVersion) - 2)]

    # filter by major version for full version string
    testVersions = []

    for version in testMajorVersions:
        l = list(filter(lambda x: x.startswith(version), versions))
        testVersions.append(l[0])

    print(testVersions)
    return(testVersions)

if __name__ == "__main__":
    main()