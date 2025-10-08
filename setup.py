from setuptools import setup, find_packages

setup(
    name="pdfmaster",
    version="0.1",
    python_requires=">=3.8,<3.12",  # This enforces Python version
    packages=find_packages(where="backend"),
    package_dir={"": "backend"},
    install_requires=open("backend/requirements.txt").read().splitlines(),
    include_package_data=True,
)
